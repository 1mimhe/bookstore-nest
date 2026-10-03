import { IsIn, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

const WEBHOOK_STATUSES = ['succeeded', 'failed'] as const;

/**
 * Payload pushed by the PSP to `POST /payments/webhook`. The endpoint
 * authenticates the call via the `x-payment-signature` HMAC header, so this
 * DTO only carries the business facts — never any trust decision.
 */
export class PaymentWebhookDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(0)
  amount: number;

  @IsIn([...WEBHOOK_STATUSES])
  status: (typeof WEBHOOK_STATUSES)[number];
}
