import { Module } from '@nestjs/common';
import { StaffController } from './staffs.controller';
import { StaffService } from './staffs.service';

@Module({
  controllers: [StaffController],
  providers: [StaffService]
})
export class StaffModule {}
