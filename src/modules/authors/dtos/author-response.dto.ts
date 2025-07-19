import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';

export class AuthorResponseDto {
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
  @Type(() => BookResponseDto)
  books?: BookResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class AuthorPlusCountResDto extends AuthorResponseDto {
  @Expose()
  bookCount: number;
}