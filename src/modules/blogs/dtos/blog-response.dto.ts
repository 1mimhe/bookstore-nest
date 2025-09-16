import { Expose, Type } from 'class-transformer';
import { AuthorCompactResponseDto } from 'src/modules/authors/dtos/author-response.dto';
import { TitleCompactResponseDto } from 'src/modules/books/dtos/title-response.dto';
import { PublisherCompactResponseDto } from 'src/modules/publishers/dtos/publisher-response.dto';
import { TagCompactResponseDto } from 'src/modules/tags/dtos/tag-response.dto';

export class BlogCompactResponseDto {
  @Expose()
  subject: string;

  @Expose()
  otherSubject?: string;

  @Expose()
  slug?: string;
  
  @Expose()
  summary?: string;

  @Expose()
  picUrl?: string;

  @Expose()
  content?: string;

  @Expose()
  titleId?: string;

  @Expose()
  authorId?: string;

  @Expose()
  publisherId?: string;

  @Expose()
  @Type(() => TagCompactResponseDto)
  tags?: TagCompactResponseDto[];

  @Expose()
  views: number;
}

export class BlogResponseDto extends BlogCompactResponseDto {
  @Expose()
  title?: TitleCompactResponseDto;

  @Expose()
  author?: AuthorCompactResponseDto;

  @Expose()
  publisher?: PublisherCompactResponseDto;
}