import { Expose, Type } from 'class-transformer';

export class BookResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  anotherName?: string;

  @Expose()
  ISBN?: string;

  @Expose()
  quarto?: string;

  @Expose()
  cover?: string;

  @Expose()
  pagesNumber?: number;

  @Expose()
  publishedAt?: Date;

  @Expose()
  publishSeries?: number;

  @Expose()
  weight?: number;

  @Expose()
  stock?: number;

  @Expose()
  price?: number;

  @Expose()
  discountPercent?: number;

  @Expose()
  sold?: number;

  @Expose()
  titleId: string;

  @Expose()
  publisherId: string;

  @Expose()
  languageId: string;

  @Expose()
  @Type(() => ImageResponseDto)
  images: ImageResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class ImageResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: string;

  @Expose()
  url: string;

  @Expose()
  bookId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}