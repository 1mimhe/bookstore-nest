import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { OrderBookDto } from './order-response.dto';

export class UnprocessableDto {
  @Expose()
  bookName: string;

  @Expose()
  publisherName: string;

  @ApiProperty({ example: UnprocessableEntityMessages.BookStock })
  @Expose()
  message: string;
}

export class CartResponseDto {
  @Type(() => UnprocessableDto)
  @Expose()
  unprocessables: UnprocessableDto[];

  @Type(() => OrderBookDto)
  @Expose()
  books: OrderBookDto[];

  @Expose()
  totalPrice: number;

  @Expose()
  discount: number;
  
  @ApiProperty({ description: 'Sum of all books` `finalPrice` (without shipping cost)' })
  @Expose()
  finalPrice: number;
}