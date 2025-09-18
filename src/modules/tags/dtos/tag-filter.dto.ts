import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TagType } from '../entities/tag.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  NameAsc = 'name-asc',
  NameDesc = 'name-desc',
  MostView = 'mostview',
  MostBooks = 'mostbooks'
}

export class TagFilterDto {
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
    default: 'mostbooks'
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}