import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('should count requests and render Prometheus exposition', () => {
    service.record('GET', 'HealthController.check', 200, 12);
    service.record('GET', 'HealthController.check', 200, 1500);

    const output = service.render();

    expect(output).toContain(
      'http_requests_total{method="GET",route="HealthController.check",status="200"} 2',
    );
    expect(output).toContain(
      'http_request_duration_seconds_bucket{method="GET",route="HealthController.check",status="200",le="0.025"} 1',
    );
    expect(output).toContain(
      'http_request_duration_seconds_bucket{method="GET",route="HealthController.check",status="200",le="+Inf"} 2',
    );
    expect(output).toContain('http_request_duration_seconds_count{');
    expect(output).toContain('nodejs_eventloop_lag_seconds_mean');
    expect(output).toContain('process_uptime_seconds');
    expect(output.endsWith('\n')).toBe(true);
  });

  it('should count 5xx responses as errors without counting 4xx', () => {
    service.record('POST', 'OrdersController.submitOrder', 500, 30);
    service.record('GET', 'OrdersController.getAllOrders', 404, 5);

    const output = service.render();

    expect(output).toContain(
      'http_request_errors_total{method="POST",route="OrdersController.submitOrder"} 1',
    );
    expect(output).not.toContain('OrdersController.getAllOrders"} 1');
  });
});
