import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ShippingTypes } from '../entities/order.entity';

export class InitiateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  shippingAddressId: string;

  @IsNotEmpty()
  @IsEnum(ShippingTypes)
  shippingType: ShippingTypes;

  @IsOptional()
  @IsString()
  discountCode: string;
}