import { IsAlphanumeric, IsEmail, IsEnum, IsPhoneNumber, IsStrongPassword } from 'class-validator';
import { Genders } from '../entities/user.entity';

export class CreateUserDto {
  @IsAlphanumeric()
  username: string;

  @IsStrongPassword()
  password: string;
  
  firstName: string;
  lastName?: string;
  
  @IsEnum(Genders)
  gender?: string;

  @IsPhoneNumber()
  phoneNumber?: string;

  @IsEmail()
  email?: string;
}
