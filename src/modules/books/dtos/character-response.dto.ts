import { Expose, Type } from 'class-transformer';
import { TitleCompactResponseDto } from './title-response.dto';

export class CharacterCompactResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  nickName?: string;

  @Expose()
  slug: string;

  @Expose()
  biography?: string;

  @Expose()
  picUrl?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date | null;
}

export class CharacterResponseDto extends CharacterCompactResponseDto {
  @Expose()
  @Type(() => TitleCompactResponseDto)
  titles?: TitleCompactResponseDto[];
}