import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export enum AuthorSortBy {
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  MostViews = 'most_views',
  MostBooks = 'most_books',
  Newest = 'newest'
}

export class AuthorQueryDto {
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

  @ApiPropertyOptional({
    default: AuthorSortBy.Newest,
    enum: AuthorSortBy
  })
  @IsOptional()
  @IsEnum(AuthorSortBy)
  sortBy?: AuthorSortBy;
}