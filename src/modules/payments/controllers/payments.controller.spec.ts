import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { createHmac } from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../services/payments.service';
import { PaymentStatuses } from '../entities/payment.entity';

const SECRET = 'test-webhook-secret-0123456789';

describe('PaymentsController (webhook)', () => {
  let controller: PaymentsController;
  let paymentsService: { applyWebhookResult: jest.Mock };
  let events: { emit: jest.Mock };

  const body = {
    paymentId: 'MOCK-123E4567-250000',
    orderId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 250000,
    status: 'succeeded' as const,
  };
  const signature = createHmac('sha256', SECRET)
    .update(JSON.stringify(body))
    .digest('hex');

  beforeEach(async () => {
    paymentsService = {
      applyWebhookResult: jest.fn().mockResolvedValue({
        paymentId: body.paymentId,
        orderId: body.orderId,
        amount: body.amount,
        status: PaymentStatuses.Succeeded,
      }),
    };
    events = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: paymentsService },
        { provide: ConfigService, useValue: { get: () => SECRET } },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should persist and emit on a valid signature', async () => {
    const result = await controller.handleWebhook(body, signature);

    expect(paymentsService.applyWebhookResult).toHaveBeenCalledWith(
      expect.objectContaining({ paymentId: body.paymentId, succeeded: true }),
    );
    expect(events.emit).toHaveBeenCalledWith(
      'payment.succeeded',
      expect.objectContaining({ paymentId: body.paymentId }),
    );
    expect(result).toEqual({ received: true, status: PaymentStatuses.Succeeded });
  });

  it('should reject a forged signature', async () => {
    await expect(
      controller.handleWebhook(body, 'forged-signature'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject a missing signature', async () => {
    await expect(controller.handleWebhook(body, undefined)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
