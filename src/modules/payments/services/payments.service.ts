import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentProviders, PaymentStatuses } from '../entities/payment.entity';

interface WebhookOutcome {
  paymentId: string;
  orderId: string;
  amount: number;
  succeeded: boolean;
  rawPayload?: Record<string, unknown> | null;
}

/**
 * Auditable payment history. Webhook deliveries upsert by the gateway's
 * `paymentId`, so duplicate PSP retries stay idempotent and the pull-based
 * `verifyPayment` flow in `OrdersService` is never blocked.
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
  ) {}

  findByPaymentId(paymentId: string): Promise<Payment | null> {
    return this.paymentsRepo.findOne({ where: { paymentId } });
  }

  async applyWebhookResult(outcome: WebhookOutcome): Promise<Payment> {
    const existing = await this.paymentsRepo.findOne({
      where: { paymentId: outcome.paymentId },
    });

    if (existing) {
      existing.status = outcome.succeeded
        ? PaymentStatuses.Succeeded
        : PaymentStatuses.Failed;
      existing.rawPayload = outcome.rawPayload ?? existing.rawPayload ?? null;
      return this.paymentsRepo.save(existing);
    }

    const payment = this.paymentsRepo.create({
      paymentId: outcome.paymentId,
      orderId: outcome.orderId,
      amount: outcome.amount,
      provider: PaymentProviders.Mock,
      status: outcome.succeeded
        ? PaymentStatuses.Succeeded
        : PaymentStatuses.Failed,
      rawPayload: outcome.rawPayload ?? null,
    });
    return this.paymentsRepo.save(payment);
  }
}
