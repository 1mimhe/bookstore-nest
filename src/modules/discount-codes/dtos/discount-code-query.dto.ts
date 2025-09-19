import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DiscountCodeType } from '../discount-code.entity';

export class DiscountCodeQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(DiscountCodeType)
  type?: DiscountCodeType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}
