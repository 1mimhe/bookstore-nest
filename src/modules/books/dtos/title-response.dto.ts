import { Expose, Type } from 'class-transformer';
import { AuthorResponseDto } from 'src/modules/authors/dtos/author-response.dto';
import { TagCompactResponseDto } from 'src/modules/tags/dtos/tag-response.dto';
import { BookResponseDto } from './book-response.dto';

export class TitleCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug?: string;

  @Expose()
  summary?: string;

  @Expose()
  originallyPublishedAt?: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class TitleResponseDto {
  @Expose()
  @Type(() => AuthorResponseDto)
  authors: AuthorResponseDto[];

  @Expose()
  @Type(() => TagCompactResponseDto)
  tags: TagCompactResponseDto[];

  @Expose()
  @Type(() => BookResponseDto)
  books: BookResponseDto[];
}