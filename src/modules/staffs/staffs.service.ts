import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { SignupStaffDto } from './dtos/signup-staff.dto';
import { User } from '../users/entities/user.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { generateNumberId } from 'src/common/utilities/generate-id';
import { EntityTypes, StaffAction, StaffActionTypes } from './entities/staff-action.entity';
import { Review } from '../reviews/entities/review.entity';

@Injectable()
export class StaffsService {
  constructor(
    private authService: AuthService,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>,
    private dataSource: DataSource
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

  async deleteReview(reviewId: string) {
    return this.dataSource.getRepository(Review).softDelete({
      id: reviewId
    });
  }
}
