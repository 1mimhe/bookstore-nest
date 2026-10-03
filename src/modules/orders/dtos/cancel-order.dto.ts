import { IsNotEmpty, IsUUID } from 'class-validator';

/** Identifies the order to cancel. Only unpaid `Pending` orders can be canceled. */
export class CancelOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;
}
