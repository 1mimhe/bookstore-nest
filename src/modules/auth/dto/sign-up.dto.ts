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
import { Genders } from '../../users/entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @Transform(({ value }) => value?.toLowerCase())
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
  gender?: Genders;

  @IsOptional()
  @IsPhoneNumber('IR')
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
