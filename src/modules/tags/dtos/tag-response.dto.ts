import { Expose, Type } from 'class-transformer';
import { TagType } from '../tag.entity';
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
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}

export class TagResponseDto extends TagCompactResponseDto {
  @Expose()
  @Type(() => TitleCompactResponseDto)
  titles: TitleCompactResponseDto[];
}