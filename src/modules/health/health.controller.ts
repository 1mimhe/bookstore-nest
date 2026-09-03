import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BypassTransform } from '../../common/decorators/bypass-transform.decorator';

@Controller('health')
@ApiTags('Health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @ApiOperation({
    summary: 'Check system health and readiness (Database, Memory, Event Loop)',
  })
  @Get()
  @HealthCheck()
  @BypassTransform()
  check() {
    return this.health.check([
      // Database ping probe
      () => this.db.pingCheck('database', { timeout: 3000 }),
      // Memory heap usage (max 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      // Memory RSS allocation (max 500MB)
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }
}
