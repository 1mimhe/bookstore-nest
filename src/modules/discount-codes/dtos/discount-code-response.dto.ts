import { Expose, Type } from 'class-transformer';
import { DiscountCodeType } from '../discount-code.entity';

export class DiscountCodeResponseDto {
  @Expose()
  id: string;

  @Expose()
  code: string;

  @Expose()
  type: DiscountCodeType;

  @Expose()
  value: number;

  @Expose()
  minPurchase?: number;

  @Expose()
  maxPurchase?: number;

  @Expose()
  startDate?: Date;

  @Expose()
  endDate?: Date;

  @Expose()
  usedCount: number;

  @Expose()
  usageLimit?: number;

  @Expose()
  isActive: boolean;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class DiscountCodeCheckResponseDto {
  @Expose()
  isValid: boolean;

  @Expose()
  discountAmount: number;

  @Expose()
  finalPrice: number;

  @Expose()
  message?: string;
}
