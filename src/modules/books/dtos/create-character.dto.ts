import { Transform } from 'class-transformer';
import { IsString, IsUrl, IsOptional, IsNotEmpty } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateCharacterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  nickName?: string;

  @Transform(({ obj, value }) => {
    if (value) return makeUnique(value);
    if (obj.fullName && obj.fullName.trim()) {
      return makeUnique(obj.fullName.trim());
    }
    return undefined;
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsUrl()
  @IsOptional()
  picUrl?: string;
}