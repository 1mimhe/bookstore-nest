import { Module } from '@nestjs/common';
import { ViewsService } from './views.service';
import { RedisModule } from '../app/redis.module';

@Module({
  imports: [RedisModule],
  providers: [ViewsService],
  exports: [ViewsService]
})
export class ViewsModule {}
