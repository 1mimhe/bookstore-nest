import { PartialType } from '@nestjs/swagger';
import { SignupUserDto } from 'src/modules/auth/dto/sign-up.dto';

export class UpdateUserDto extends PartialType(SignupUserDto) {}