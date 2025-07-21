import { IsOptional, IsString, IsUrl } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';
import { Transform } from 'class-transformer';

export class UpdatePublisherDto {
  @IsOptional()
  @IsString()
  publisherName?: string;

  @Transform(({ obj, value }) => {
    if (value) return makeUnique(value);
    if (obj.publisherName && obj.publisherName.trim()) {
      return makeUnique(obj.publisherName);
    }
    return undefined;
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}