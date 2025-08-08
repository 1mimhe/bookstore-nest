import { PartialType } from '@nestjs/swagger';
import { SignupUserDto } from './sign-up.dto';

export class SigninTestDto extends PartialType(SignupUserDto) {}