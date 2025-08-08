import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { EntityManager, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { SignupStaffDto } from './dtos/signup-staff.dto';
import { RolesEnum } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { generateNumberId } from 'src/common/utilities/generate-id';
import { EntityTypes, StaffAction, StaffActionTypes } from './entities/staff-action.entity';

@Injectable()
export class StaffsService {
  constructor(
    private authService: AuthService,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    @InjectRepository(StaffAction) private actionRepo: Repository<StaffAction>
  ) {}

  async signup(
    {
      nationalId,
      roles,
      ...userDto
    }: SignupStaffDto
  ): Promise<Staff | never> {
    const employeeId = await generateNumberId(this.staffRepo, 'nationalId');
    return this.authService.signup(
      userDto,
      roles,
      async (user: User, manager: EntityManager) => {
        const staff = manager.create(Staff, {
          userId: user.id,
          user,
          nationalId,
          employeeId,
        });
        return manager.save(Staff, staff).catch((error) => {
          dbErrorHandler(error);
          throw error;
        });
      }
    );
  }

  async createAction(
    actionDto: {
      staffId: string,
      type: StaffActionTypes,
      entityId: string,
      entityType: EntityTypes,
    },
    manager: EntityManager
  ): Promise<StaffAction | never> {
    const action = manager.create(StaffAction, actionDto);
    return manager.save(StaffAction, action).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }
}
