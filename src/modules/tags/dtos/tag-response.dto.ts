import { Expose, Type } from 'class-transformer';
import { TagType } from '../entities/tag.entity';
import { TitleCompactResponseDto } from 'src/modules/books/dtos/title-response.dto';

export class TagCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description?: string;

  @Expose()
  type: TagType;

  @Expose()
  views: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}

export class TagCompactPlusResponseDto extends TagCompactResponseDto {
  @Expose()
  titleCount: number;
}

export class TagResponseDto extends TagCompactResponseDto {
  @Expose()
  @Type(() => TitleCompactResponseDto)
  titles: TitleCompactResponseDto[];
}