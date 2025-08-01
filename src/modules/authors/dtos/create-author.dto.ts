import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateAuthorDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsUrl()
  picUrl: string;

  @IsOptional()
  @Transform(({ obj, value }) => {
    if (value && value.trim()) return makeUnique(value);
    if (obj.firstName) {
      return makeUnique(`${obj.firstName}-${obj.lastName ? obj.lastName : ''}`);
    }
    return undefined;
  })
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsDateString()
  dateOfDeath?: Date;
}
