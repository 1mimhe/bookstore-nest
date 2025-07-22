import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/auth/dto/sign-up.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}