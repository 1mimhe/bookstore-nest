import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsInt,
  IsBoolean,
  Min,
  IsNotEmpty,
  IsArray,
  IsUUID,
} from 'class-validator';
import { DiscountCodeType } from '../discount-code.entity';

export class CreateDiscountCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(DiscountCodeType)
  type: DiscountCodeType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchase?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPurchase?: number;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIds?: string[];
}
