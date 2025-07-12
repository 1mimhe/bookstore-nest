import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { makeUnique } from 'src/common/utilities/make-unique';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';

export class CreatePublisherDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  publisherName: string;

  @Transform(({ obj }) => {
    if (obj.slug) return makeUnique(obj.slug);
    return makeUnique(`${obj.firstName}-${obj.lastName ? obj.lastName : ''}`);
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
