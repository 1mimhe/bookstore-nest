import { Transform } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';

export class CreateAuthorDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsString()
  lastName?: string;

  @IsString()
  nickname?: string;

  @Transform(({ obj }) => {
    if (obj.slug) return makeUnique(obj.slug);
    return makeUnique(`${obj.firstName}-${obj.lastName ? obj.lastName : ''}`);
  })
  @IsString()
  slug?: string;

  @IsString()
  biography?: string;

  @IsDate()
  @IsString()
  dateOfBirth?: Date;

  @IsDate()
  dateOfDeath?: Date;
}
