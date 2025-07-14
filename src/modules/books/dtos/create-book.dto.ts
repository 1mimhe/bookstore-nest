import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Quartos, Covers } from '../entities/book.entity';

export class CreateBookDto {
  @IsString()
  name: string;

  @IsUUID()
  titleId: string;
  
  @IsUUID()
  publisherId: string;

  @IsOptional()
  @IsString()
  anotherName?: string;

  @IsOptional()
  @IsString()
  ISBN?: string;

  @IsOptional()
  @IsEnum(Quartos)
  quarto?: Quartos;

  @IsOptional()
  @IsEnum(Covers)
  cover?: Covers;

  @IsOptional()
  @IsInt()
  @Min(1)
  pagesNumber?: number;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  publishSeries?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  discountPercent?: number;
}
