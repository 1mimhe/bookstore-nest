import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';

export class BookmarksDto {
  @Expose()
  count: number;

  @Expose()
  @Type(() => BookResponseDto)
  books: BookResponseDto[];
}