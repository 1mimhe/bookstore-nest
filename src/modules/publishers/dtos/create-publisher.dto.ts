import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';
import { CreateUserDto } from 'src/modules/auth/dto/sign-up.dto';

export class SignupPublisherDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  publisherName: string;

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
