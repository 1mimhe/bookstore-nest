import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';

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
  @Type(() => UserResponseDto)
  user: UserResponseDto;

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

export class PublisherPlusResDto extends PublisherResponseDto {
  @Expose()
  bookCount: number;
}