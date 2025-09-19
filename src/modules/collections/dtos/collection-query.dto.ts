import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CollectionSortBy {
  Newest = 'newest',
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  MostBooks = 'most_books',
  MostViews = 'most_views'
}

export class CollectionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
     default: 'newest',
     enum: CollectionSortBy
  })
  @IsOptional()
  @IsEnum(CollectionSortBy)
  sortBy?: CollectionSortBy;
}