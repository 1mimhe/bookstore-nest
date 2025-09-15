import { Transform } from "class-transformer";
import { ArrayMinSize, IsAlphanumeric, IsArray, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from "class-validator";
import { makeSlug } from "src/common/utilities/make-unique";

export class CreateTitleDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;

  @Transform(({ obj, value }) => {
    if (value) return makeSlug(value);
    if (obj.name && obj.name.trim()) {
      return makeSlug(obj.name);
    }
    return undefined;
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  authorIds: string[];

  @IsOptional()
  @IsAlphanumeric()
  summary?: string;

  @IsOptional()
  @IsDateString()
  originallyPublishedAt?: Date;

  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  @IsAlphanumeric(undefined, { each: true })
  features: string[];

  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  @IsAlphanumeric(undefined, { each: true })
  quotes: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  characterIds?: string[];

  @IsOptional()
  @ArrayMinSize(1)
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}