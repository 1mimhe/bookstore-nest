import { Body, Controller, Post } from '@nestjs/common';
import { StaffsService } from './staffs.service';
import { SignupStaffDto, StaffRoles } from './dtos/signup-staff.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation } from '@nestjs/swagger';
import { ConflictResponseDto, ValidationErrorResponseDto } from 'src/common/dtos/error.dtos';
import { ConflictMessages } from 'src/common/enums/error.messages';

@Controller('staffs')
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
  @Post('signup')
  async signupStaff(@Body() body: SignupStaffDto) {
    return this.staffsService.signup(body);
  }
}
