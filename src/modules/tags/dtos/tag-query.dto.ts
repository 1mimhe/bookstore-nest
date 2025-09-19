import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TagSortBy {
  NameAsc = 'name_asc',
  NameDesc = 'name_desc',
  MostViews = 'most_views',
  MostBooks = 'most_books'
}

export class TagQueryDto {
  @ApiPropertyOptional({
    description: 'Just a simple search in names'
  })
  @IsOptional()
  @IsString()
  search?: string;
  
  @ApiPropertyOptional({
    description: 'The type of tags to retrieve (optional).',
  })
  @IsOptional()
  @IsEnum(TagType)
  type?: TagType;

  @ApiPropertyOptional({
    default: TagSortBy.MostBooks,
    enum: TagSortBy
  })
  @IsOptional()
  @IsEnum(TagSortBy)
  sortBy?: TagSortBy;
}