import { IsAlphanumeric, IsEnum, IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagType } from '../tag.entity';
import { Transform } from 'class-transformer';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Transform(({ obj, value }) => {
    if (value && value.trim()) return makeUnique(value);
    if (obj.name) {
      return makeUnique(obj.name);
    }
    return undefined;
  })
  @IsOptional()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsHexColor()
  @Transform(({ value }) => (value ? value : '#007bff'))
  color?: string;

  @IsEnum(TagType)
  type: TagType;
}