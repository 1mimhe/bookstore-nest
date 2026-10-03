import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

/**
 * Payment status is intentionally NOT part of this DTO: it is resolved
 * server-side by the payment gateway during verification. Clients only
 * reference the payment they initiated. The reference is an opaque
 * gateway-specific token (e.g. `MOCK-123E4567-250000`), not a number.
 */
export class SubmitOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;
}