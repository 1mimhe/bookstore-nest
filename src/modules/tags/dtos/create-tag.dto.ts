import { IsAlphanumeric, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';

export class CreateTagDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TagType)
  type: TagType;
}