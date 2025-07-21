import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';

export class AuthorCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName?: string;

  @Expose()
  nickname?: string;

  @Expose()
  slug: string;

  @Expose()
  biography?: string;

  @Expose()
  dateOfBirth?: Date;

  @Expose()
  dateOfDeath?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class AuthorResponseDto extends AuthorCompactResponseDto {
  @Expose()
  @Type(() => BookResponseDto)
  books?: BookResponseDto[];
}

export class AuthorPlusCountResDto extends AuthorResponseDto {
  @Expose()
  bookCount: number;
}