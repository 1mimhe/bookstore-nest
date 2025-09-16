import { Expose, Type } from 'class-transformer';
import { BookResponseDto } from 'src/modules/books/dtos/book-response.dto';

export class CollectionBookCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  collectionId: string;

  @Expose()
  bookId: string;

  @Expose()
  order: number;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}

export class CollectionBookResponseDto extends CollectionBookCompactResponseDto {
  @Expose()
  @Type(() => BookResponseDto)
  book: BookResponseDto;
}

export class CollectionCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;
  
  @Expose()
  views: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}

export class CollectionResponseDto extends CollectionCompactResponseDto {
  @Type(() => CollectionBookResponseDto)
  collectionBooks: CollectionBookResponseDto[];
}