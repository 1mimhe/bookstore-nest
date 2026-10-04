import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthAlertService } from './health-alert.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthAlertService],
})
export class HealthModule {}
