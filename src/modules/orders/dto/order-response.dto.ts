import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class OrderBookDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
  
  @Expose()
  publisherName: string;

  @Expose()
  imageUrl: string;
  
  @Expose()
  slug: string;
  
  @Expose()
  quantity: number;

  @Expose()
  price: number;
  
  @Expose()
  discountPercent: number;

  @ApiProperty({ description: 'quantity x price x (1 - discount)' })
  @Transform(({ obj }) => obj.finalPrice ?? obj.quantity * obj.price * (1 - obj.discountPercent))
  @Expose()
  finalPrice: number;
}
