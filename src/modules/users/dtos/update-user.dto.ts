import { PartialType } from '@nestjs/swagger';
import { SignupUserDto } from 'src/modules/auth/dtos/sign-up.dto';

export class UpdateUserDto extends PartialType(SignupUserDto) {}