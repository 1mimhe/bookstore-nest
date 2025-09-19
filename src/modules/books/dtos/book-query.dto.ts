import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export enum BookSortBy {
  MostLiked = 'most_liked',
  MostViews = 'most_views',
  MostSale = 'most_sale',
  Newest = 'newest'
}

export class BookQueryDto {
  @Transform(({ value }) => !value ? value : Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @Transform(({ value }) => !value ? value : Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Just a simple search in names'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;
  
  @IsOptional()
  @IsUUID()
  publisherId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({
    example: ['1900s', '1380s', '1900', '1380']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    }
    return value;
  })
  decades?: string[];

  @ApiPropertyOptional({
    default: BookSortBy.Newest,
    enum: BookSortBy
  })
  @IsOptional()
  @IsEnum(BookSortBy)
  sortBy?: BookSortBy;
}