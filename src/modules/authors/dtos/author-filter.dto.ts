import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export enum SortBy {
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  MostView = 'mostview',
  MostBooks = 'mostbooks',
  Newest = 'newest'
}

export class AuthorFilterDto {
  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  page = 1;

  @Transform(({ value }) => Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit = 10;

  @ApiPropertyOptional({
    description: 'Just a simple search in names'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}