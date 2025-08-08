import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsEnum, IsNotEmpty, IsNumberString } from 'class-validator';
import { SignupUserDto } from 'src/modules/auth/dtos/sign-up.dto';
import { RolesEnum } from 'src/modules/users/entities/role.entity';

type StaffRoleType = RolesEnum.ContentManager | 
  RolesEnum.InventoryManager | RolesEnum.OrderManager;

export enum StaffRoles {
  ContentManager = RolesEnum.ContentManager,
  InventoryManager = RolesEnum.InventoryManager,
  OrderManager = RolesEnum.OrderManager
}

export class SignupStaffDto extends SignupUserDto {
  @IsNotEmpty()
  @IsNumberString()
  nationalId: string;

  @ApiProperty({ enum: StaffRoles, isArray: true })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsEnum(StaffRoles, { each: true })
  roles: StaffRoleType[];
}