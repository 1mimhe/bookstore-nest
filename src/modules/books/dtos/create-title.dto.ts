import { Transform } from "class-transformer";
import { IsAlphanumeric, IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { makeUnique } from "src/common/utilities/make-unique";

export class CreateTitleDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  name: string;

  @Transform(({ obj, value }) => {
    if (value) return makeUnique(value);
    if (obj.name && obj.name.trim()) {
      return makeUnique(obj.name);
    }
    return undefined;
  })
  @IsOptional()
  @IsAlphanumeric()
  slug?: string;

  @IsOptional()
  @IsAlphanumeric()
  summary?: string;

  @IsOptional()
  @IsDateString()
  originallyPublishedAt?: Date;
}