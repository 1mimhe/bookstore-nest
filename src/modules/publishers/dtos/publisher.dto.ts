import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';
import { UserDto } from 'src/modules/users/dtos/user.dto';

export class CreatePublisherResponseDto {
  @Expose()
  id: string;

  @Expose()
  publisherName: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class PublisherResponseDto {
  @Expose()
  id: string;

  @Expose()
  publisherName: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  logoUrl?: string;

  @Expose()
  @Type(() => BookResponseDto)
  books?: BookResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}