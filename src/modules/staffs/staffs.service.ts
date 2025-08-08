import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { EntityManager, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { SignupStaffDto } from './dtos/signup-staff.dto';
import { Roles } from '../users/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { generateNumberId } from 'src/common/utilities/generate-id';

@Injectable()
export class StaffsService {
  constructor(
    private authService: AuthService,
    @InjectRepository(Staff) private staffRepo: Repository<Staff>
  ) {}

  async signup(
    {
      nationalId,
      roles,
      ...userDto
    }: SignupStaffDto
  ) {
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
}
