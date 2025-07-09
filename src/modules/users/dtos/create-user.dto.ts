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
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => value?.toLowercase())
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
