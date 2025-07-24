import { Expose, Transform, Type } from 'class-transformer';
import { AuthorResponseDto } from 'src/modules/authors/dtos/author-response.dto';
import { TagCompactResponseDto } from 'src/modules/tags/dtos/tag-response.dto';
import { BookResponseDto } from './book-response.dto';
import { Feature } from '../entities/feature.entity';
import { Quote } from '../entities/quote.entity';

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

export class TitleResponseDto extends TitleCompactResponseDto {
  @Transform(({ obj }) => obj.features?.map((feature: Feature) => feature.feature))
  @Expose()
  features?: string[];

  @Transform(({ obj }) => obj.quotes?.map((quote: Quote) => quote.quote))
  @Expose()
  quotes?: string[];

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