import { IsAlphanumeric, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';
import { Genders } from '../entities/user.entity';

export class CreateUserDto {
  @IsAlphanumeric()
  username: string;

  @IsStrongPassword()
  password: string;
  
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;
  
  @IsOptional()
  @IsEnum(Genders)
  gender?: string;

  @IsOptional()
  @IsPhoneNumber('IR')
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
