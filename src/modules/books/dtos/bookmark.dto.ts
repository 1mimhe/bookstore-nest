import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { BookmarkTypes } from '../entities/bookmark.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BookmarkDto {
  @IsNotEmpty()
  @IsUUID()
  bookId: string;

  @ApiProperty({ default: BookmarkTypes.Library })
  @IsOptional()
  @IsEnum(BookmarkTypes)
  type?: BookmarkTypes;
}