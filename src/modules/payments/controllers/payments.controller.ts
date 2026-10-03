import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Throttle } from '@nestjs/throttler';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { EventNames } from 'src/common/enums/event.names';
import { PaymentWebhookDto } from '../dtos/payment-webhook.dto';
import { PaymentsService } from '../services/payments.service';

const SIGNATURE_HEADER = 'x-payment-signature';

/**
 * Asynchronous PSP callback. The gateway pulls verification in
 * `OrdersService.submitOrder`; this endpoint covers the push path: it
 * authenticates the caller via HMAC, persists the outcome idempotently, and
 * emits a domain event so order finalization can react without a
 * `PaymentsModule` ↔ `OrdersModule` import cycle.
 */
@Throttle({ default: { limit: 30, ttl: 60000 } })
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private config: ConfigService,
    private events: EventEmitter2,
  ) {}

  @ApiOperation({
    summary: 'Receive asynchronous payment outcome from the PSP',
    description:
      'Verifies the `x-payment-signature` HMAC (SHA-256 over the JSON body ' +
      'with `PAYMENT_WEBHOOK_SECRET`), persists the result idempotently, and ' +
      'emits `payment.succeeded` / `payment.failed`.',
  })
  @ApiOkResponse({ description: 'Webhook accepted.' })
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  async handleWebhook(
    @Body() body: PaymentWebhookDto,
    @Headers(SIGNATURE_HEADER) signature?: string,
  ) {
    this.assertSignature(body, signature);

    const succeeded = body.status === 'succeeded';
    const payment = await this.paymentsService.applyWebhookResult({
      paymentId: body.paymentId,
      orderId: body.orderId,
      amount: body.amount,
      succeeded,
      rawPayload: { ...body },
    });

    this.events.emit(
      succeeded ? EventNames.PaymentSucceeded : EventNames.PaymentFailed,
      { paymentId: payment.paymentId, orderId: payment.orderId, amount: payment.amount },
    );

    return { received: true, status: payment.status };
  }

  private assertSignature(body: PaymentWebhookDto, signature?: string): void {
    const secret = this.config.get<string>('PAYMENT_WEBHOOK_SECRET', '');
    if (!secret || !signature) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }
    const expected = createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid webhook signature.');
    }
  }
}
