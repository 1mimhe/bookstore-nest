import { Expose, Type } from 'class-transformer';
import { UserDto } from 'src/modules/users/dtos/user.dto';

export class PublisherDto {
  @Expose()
  publisherName: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
}
