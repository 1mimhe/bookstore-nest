import { CreateAuthorDto } from './create-author.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}