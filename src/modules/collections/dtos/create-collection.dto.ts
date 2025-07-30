import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @Transform(({ obj, value }) => {
    if (value) return makeUnique(value);    
    if (obj.name && obj.name.trim()) {
      return makeUnique(obj.name);
    }
    return undefined;
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;
}