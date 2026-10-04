import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BypassTransform } from 'src/common/decorators/bypass-transform.decorator';
import { MetricsService } from './metrics.service';

/**
 * Prometheus scrape endpoint. Public by design (histograms and gauges only,
 * no request payloads or user data) and excluded from both the response
 * envelope and its own request recording.
 */
@Controller('metrics')
@ApiTags('Metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @ApiOperation({
    summary: 'Prometheus metrics (request latency, errors, event-loop lag)',
  })
  @Get()
  @BypassTransform()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  scrape(): string {
    return this.metrics.render();
  }
}
