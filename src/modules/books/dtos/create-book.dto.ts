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
  IsArray,
  IsNotEmpty,
  ArrayNotEmpty,
  ValidateNested,
  IsAlpha,
} from 'class-validator';
import { Quartos, Covers } from '../entities/book.entity';
import { CreateBookImageDto } from './book-image.dto';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsUUID()
  titleId: string;
  
  @IsNotEmpty()
  @IsUUID()
  publisherId: string;

  @IsNotEmpty()
  @IsAlpha()
  languageCode: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  translatorIds?: string[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateBookImageDto)
  images?: CreateBookImageDto[];

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
