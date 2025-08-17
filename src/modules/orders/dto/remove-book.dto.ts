import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class RemoveBookFromCartDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsNotEmpty()
  @IsUUID()
  bookId: string;
}