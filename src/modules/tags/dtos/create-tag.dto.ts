import { IsAlphanumeric, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';
import { Transform } from 'class-transformer';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateTagDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;

  @Transform(({ obj, value }) => {
    if (value && value.trim()) return makeUnique(value);
    if (obj.name) {
      return makeUnique(obj.name);
    }
    return undefined;
  })
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TagType)
  type: TagType;
}