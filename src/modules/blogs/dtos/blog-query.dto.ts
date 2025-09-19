import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export enum BlogSortBy {
  MostViews = 'most_views',
  Newest = 'newest'
}

export class BlogQueryDto {
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
    description: 'Just a simple search in subjects'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  titleId?: string;

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
    default: BlogSortBy.Newest,
    enum: BlogSortBy
  })
  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy?: BlogSortBy;
}