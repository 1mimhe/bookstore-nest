import { Transform } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateAuthorDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsString()
  lastName?: string;

  @IsString()
  nickname?: string;

  @Transform(({ obj, value }) => {
    if (value && value.trim()) return makeUnique(value);
    if (obj.firstName) {
      return makeUnique(`${obj.firstName}-${obj.lastName ? obj.lastName : ''}`);
    }
    return undefined;
  })
  @IsString()
  slug?: string;

  @IsString()
  biography?: string;

  @IsDateString()
  dateOfBirth?: Date;

  @IsDateString()
  dateOfDeath?: Date;
}
