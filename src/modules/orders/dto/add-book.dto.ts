import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class AddBookToCartDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsNotEmpty()
  @IsUUID()
  bookId: string;
}