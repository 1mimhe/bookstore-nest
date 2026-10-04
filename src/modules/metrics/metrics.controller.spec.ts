import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('MetricsController', () => {
  it('should return the rendered exposition', () => {
    const exposition = '# HELP http_requests_total Test.\n';
    const metrics = { render: jest.fn().mockReturnValue(exposition) };
    const controller = new MetricsController(metrics as unknown as MetricsService);

    expect(controller.scrape()).toBe(exposition);
    expect(metrics.render).toHaveBeenCalled();
  });
});
