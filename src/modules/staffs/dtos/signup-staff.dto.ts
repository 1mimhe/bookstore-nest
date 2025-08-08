import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayNotEmpty, IsEnum, IsNotEmpty, IsNumberString } from 'class-validator';
import { SignupUserDto } from 'src/modules/auth/dto/sign-up.dto';
import { Roles } from 'src/modules/users/entities/role.entity';

type StaffRoleType = Roles.ContentManager | 
  Roles.InventoryManager | Roles.OrderManager;

export enum StaffRoles {
  ContentManager = Roles.ContentManager,
  InventoryManager = Roles.InventoryManager,
  OrderManager = Roles.OrderManager
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