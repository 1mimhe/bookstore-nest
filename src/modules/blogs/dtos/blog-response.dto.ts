import { Expose, Type } from 'class-transformer';
import { AuthorResponseDto } from 'src/modules/authors/dtos/author-response.dto';
import { TitleResponseDto } from 'src/modules/books/dtos/title-response.dto';
import { PublisherResponseDto } from 'src/modules/publishers/dtos/publisher-response.dto';
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
}

export class BlogResponseDto extends BlogCompactResponseDto {
  @Expose()
  title?: TitleResponseDto;

  @Expose()
  author?: AuthorResponseDto;

  @Expose()
  publisher?: PublisherResponseDto;
}