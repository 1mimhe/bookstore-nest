import { IsEnum, IsUrl } from 'class-validator';
import { BookImageTypes } from '../entities/book-image.entity';

export class CreateBookImageDto {
  @IsEnum(BookImageTypes)
  type: BookImageTypes;

  @IsUrl()
  url: string;
}
