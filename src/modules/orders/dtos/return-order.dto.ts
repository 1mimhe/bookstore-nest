import { IsNotEmpty, IsUUID } from 'class-validator';

/** Identifies the order to return. Only `Delivered` orders can be returned. */
export class ReturnOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}
