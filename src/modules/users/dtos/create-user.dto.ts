import {
  IsAlphanumeric,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Genders } from '../entities/user.entity';

export class CreateUserDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsNotEmpty()
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
