import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export enum SortBy {
  MostLiked = 'mostliked',
  MostView = 'mostview',
  MostSale = 'mostsale',
  Newest = 'newest'
}

export class BookFilterDto {
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
    examples: ['1900s', '1380s', '800s', '1900', '1380']
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

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}