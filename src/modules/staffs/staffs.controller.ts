import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { SignupStaffDto, StaffRoles } from './dtos/signup-staff.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConflictResponseDto, ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages } from 'src/common/enums/error.messages';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { RolesEnum } from '../users/entities/role.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('staffs')
@ApiTags('Staff')
export class StaffsController {
  constructor(private staffsService: StaffsService) {}

  @ApiOperation({
    summary: 'Sign up a new staff (For Admin)',
    description: `Creates a new staff user with specified roles. Only accessible by admin users.
      The request body must conform to the SignupStaffDto schema, which includes staff details
      and one or more roles from \`StaffRoles\`.
    `
  })
  @ApiBadRequestResponse({
    type: ValidationErrorResponseDto
  })
  @ApiConflictResponse({
    type: ConflictResponseDto
  })
  @ApiConflictResponse({
    description: ConflictMessages.NationalId
  })
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(RolesEnum.Admin)
  @Post('signup')
  async signupStaff(@Body() body: SignupStaffDto) {
    return this.staffsService.signup(body);
  }
}
