import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';

export class PublisherCompactResponseDto {
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
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class CreatePublisherResponseDto extends PublisherCompactResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class PublisherResponseDto extends PublisherCompactResponseDto {
  @Expose()
  @Type(() => BookResponseDto)
  books?: BookResponseDto[];
}

export class PublisherPlusResDto extends PublisherResponseDto {
  @Expose()
  bookCount: number;
}