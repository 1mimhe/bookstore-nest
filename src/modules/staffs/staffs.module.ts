import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffAction } from './entities/staff-action.entity';
import { AuthModule } from '../auth/auth.module';
import { TokenModule } from '../token/token.module';

import { StaffAuditListener } from './listeners/staff-audit.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Staff,
      StaffAction,
    ]),
    AuthModule,
    TokenModule
  ],
  controllers: [StaffsController],
  providers: [StaffsService, StaffAuditListener],
  exports: [StaffsService]
})
export class StaffModule {}
