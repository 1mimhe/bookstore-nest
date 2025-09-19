import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { OrderStatuses, PaymentStatuses, ShippingTypes } from '../entities/order.entity';
import { AddressResponseDto } from 'src/modules/users/dtos/address-response.dto';

export class OrderBookDto {
  @Expose()
  id: string;

  @Transform(({ obj }) => obj.name ?? obj.book?.name)
  @Expose()
  name: string;
  
  @Transform(({ obj }) => obj.publisherName ?? obj.book?.publisher?.publisherName)
  @Expose()
  publisherName: string;

  @Transform(({ obj }) => obj.imageUrl ?? obj.book?.images?.[0]?.url)
  @Expose()
  imageUrl: string;
  
  @Transform(({ obj }) => obj.slug ?? obj.title?.book?.slug)
  @Expose()
  slug: string;
  
  @Expose()
  quantity: number;
  
  @Expose()
  discountPercent: number;

  @Expose()
  price: number;  

  @ApiProperty({ description: 'quantity x price x (1 - discount)' })
  @Transform(({ obj }) => obj.finalPrice ?? obj.quantity * obj.price * (1 - obj.discountPercent))
  @Expose()
  finalPrice: number;
}


export class OrderResponseDto {
  @Expose()
  id: string;

  @Type(() => OrderBookDto)
  @Expose()
  orderBooks: OrderBookDto;

  @Type(() => AddressResponseDto)
  @Expose()
  shippingAddress: AddressResponseDto;

  @Expose()
  paymentStatus: PaymentStatuses;

  @Expose()
  orderStatus: OrderStatuses;

  @Expose()
  shippingType: ShippingTypes;

  @Expose()
  shippingPrice: number;

  @Expose()
  totalPrice: number;

  @Expose()
  discountCode: number;

  @Expose()
  discountAmount: number;

  @Expose()
  finalPrice: number;

  @Expose()
  paymentId: string;

  @Expose()
  trackingCode: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}