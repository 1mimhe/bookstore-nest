import { IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  Newest = 'newest',
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  MostBooks = 'mostbooks',
  MostView = 'mostview'
}

export class CollectionFilterDto {
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
     default: 'newest'
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}