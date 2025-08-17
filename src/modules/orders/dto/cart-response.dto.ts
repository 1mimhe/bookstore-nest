import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';

export class UnprocessableDto {
  @Expose()
  bookName: string;

  @Expose()
  publisherName: string;

  @ApiProperty({ example: UnprocessableEntityMessages.BookStock })
  @Expose()
  message: string;
}

export class CartBookDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
  
  @Expose()
  slug: string;
  
  @Expose()
  publisherName: string
  
  @Expose()
  quantity: number;

  @Expose()
  price: number;
  
  @Expose()
  discountPercent: number;

  @ApiProperty({ description: 'quantity x price x (1 - discount)' })
  @Expose()
  finalPrice: number;
}

export class CartResponseDto {
  @Type(() => UnprocessableDto)
  @Expose()
  unprocessables: UnprocessableDto[];

  @Type(() => CartBookDto)
  @Expose()
  books: CartBookDto[];

  @Expose()
  totalPrice: number;

  @Expose()
  discount: number;
  
  @ApiProperty({ description: 'Sum of all books` `finalPrice` (without shipping cost)' })
  @Expose()
  finalPrice: number;
}