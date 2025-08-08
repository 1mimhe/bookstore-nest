import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { StaffAction } from './entities/staff-action.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Staff,
      StaffAction,
    ]),
    AuthModule
  ],
  controllers: [StaffsController],
  providers: [StaffsService],
  exports: [StaffsService]
})
export class StaffModule {}
