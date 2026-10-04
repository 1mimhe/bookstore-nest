import { Injectable, Logger, Optional } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { EventNames } from 'src/common/enums/event.names';

/**
 * Log-only alert hook for the `/health` probes. Every minute it re-runs the
 * same checks as `HealthController` (database ping, heap, RSS); when any
 * probe fails it writes a structured error log and emits `health.degraded`
 * so a future Slack/email notifier can subscribe without touching this code.
 * No external credentials are required — delivery is intentionally out of
 * scope for this change.
 */
@Injectable()
export class HealthAlertService {
  private readonly logger = new Logger(HealthAlertService.name);
  private alerted = false;

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    @Optional() private readonly events?: EventEmitter2,
  ) {}

  @Cron('0 * * * * *')
  async pollHealth(): Promise<void> {
    try {
      await this.health.check([
        () => this.db.pingCheck('database', { timeout: 3000 }),
        () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
      ]);
      this.alerted = false;
    } catch (error) {
      this.logger.error(
        `Health probes failing: ${error instanceof Error ? error.message : error}`,
      );
      if (!this.alerted) {
        this.alerted = true;
        // Optional: a bare HealthModule (e.g. isolated tests) has no global
        // emitter — the structured error log above remains the alert.
        this.events?.emit(EventNames.HealthDegraded, {
          at: new Date().toISOString(),
        });
      }
    }
  }
}
