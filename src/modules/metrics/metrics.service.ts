import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { monitorEventLoopDelay, IntervalHistogram } from 'node:perf_hooks';

/** Prometheus exposition buckets (seconds) for HTTP request latency. */
const LATENCY_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

interface HistogramSeries {
  buckets: number[];
  sum: number;
  count: number;
}

/**
 * In-memory Prometheus metrics (no extra dependency). Routes are recorded by
 * controller + handler name — never raw URLs — so user ids and slugs cannot
 * explode label cardinality. Rendered in the Prometheus text exposition
 * format by `MetricsController`.
 */
@Injectable()
export class MetricsService implements OnModuleDestroy {
  private readonly startedAt = Date.now();
  private readonly requests = new Map<string, number>();
  private readonly errors = new Map<string, number>();
  private readonly histograms = new Map<string, HistogramSeries>();
  private readonly eventLoopDelay: IntervalHistogram;

  constructor() {
    this.eventLoopDelay = monitorEventLoopDelay({ resolution: 10 });
    this.eventLoopDelay.enable();
  }

  onModuleDestroy() {
    this.eventLoopDelay.disable();
  }

  record(method: string, route: string, statusCode: number, durationMs: number): void {
    const key = this.seriesKey(method, route, statusCode);
    this.requests.set(key, (this.requests.get(key) ?? 0) + 1);

    if (statusCode >= 500) {
      const errorKey = `${method} ${route}`;
      this.errors.set(errorKey, (this.errors.get(errorKey) ?? 0) + 1);
    }

    const durationS = durationMs / 1000;
    let series = this.histograms.get(key);
    if (!series) {
      series = { buckets: new Array(LATENCY_BUCKETS.length + 1).fill(0), sum: 0, count: 0 };
      this.histograms.set(key, series);
    }
    series.count += 1;
    series.sum += durationS;
    const bucketIndex = LATENCY_BUCKETS.findIndex(b => durationS <= b);
    const target = bucketIndex === -1 ? series.buckets.length - 1 : bucketIndex;
    for (let i = target; i < series.buckets.length; i++) {
      series.buckets[i] += 1;
    }
  }

  render(): string {
    const lines: string[] = [
      '# HELP http_requests_total Total HTTP requests.',
      '# TYPE http_requests_total counter',
    ];
    for (const [key, count] of this.requests) {
      lines.push(`http_requests_total{${key}} ${count}`);
    }

    lines.push(
      '# HELP http_request_errors_total Total HTTP requests ending in a 5xx status.',
      '# TYPE http_request_errors_total counter',
    );
    for (const [key, count] of this.errors) {
      const [method, route] = key.split(' ');
      lines.push(
        `http_request_errors_total{method="${method}",route="${route}"} ${count}`,
      );
    }

    lines.push(
      '# HELP http_request_duration_seconds HTTP request latency in seconds.',
      '# TYPE http_request_duration_seconds histogram',
    );
    for (const [key, series] of this.histograms) {
      LATENCY_BUCKETS.forEach((bound, i) => {
        lines.push(
          `http_request_duration_seconds_bucket{${key},le="${bound}"} ${series.buckets[i]}`,
        );
      });
      lines.push(`http_request_duration_seconds_bucket{${key},le="+Inf"} ${series.count}`);
      lines.push(`http_request_duration_seconds_sum{${key}} ${series.sum}`);
      lines.push(`http_request_duration_seconds_count{${key}} ${series.count}`);
    }

    lines.push(
      '# HELP nodejs_eventloop_lag_seconds Event loop delay in seconds.',
      '# TYPE nodejs_eventloop_lag_seconds gauge',
      `nodejs_eventloop_lag_seconds_mean ${this.eventLoopDelay.mean / 1e9}`,
      `nodejs_eventloop_lag_seconds_max ${this.eventLoopDelay.max / 1e9}`,
      '# HELP process_uptime_seconds Application uptime in seconds.',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${(Date.now() - this.startedAt) / 1000}`,
    );
    return `${lines.join('\n')}\n`;
  }

  private seriesKey(method: string, route: string, statusCode: number): string {
    return `method="${this.escape(method)}",route="${this.escape(route)}",status="${statusCode}"`;
  }

  private escape(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }
}
