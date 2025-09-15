import { IsEnum, IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';
import { Transform } from 'class-transformer';
import { makeSlug } from 'src/common/utilities/make-slug';

export class CreateTagDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Transform(({ obj, value }) => {
    if (value && value.trim()) return makeSlug(value);
    if (obj.name) {
      return makeSlug(obj.name);
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