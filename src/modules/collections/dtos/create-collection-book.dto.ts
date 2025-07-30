import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCollectionBookDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsOptional()
  @IsString()
  description: string;
}