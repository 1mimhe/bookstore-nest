import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PaymentStatuses } from '../entities/payment.entity';
import { PaymentsService } from './payments.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let repo: ReturnType<typeof createMockRepository>;

  const outcome = {
    paymentId: 'MOCK-123E4567-250000',
    orderId: '123e4567-e89b-12d3-a456-426614174000',
    amount: 250000,
    succeeded: true,
  };

  beforeEach(async () => {
    repo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(Payment), useValue: repo },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a succeeded payment when no record exists', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.applyWebhookResult(outcome);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentId: outcome.paymentId,
        orderId: outcome.orderId,
        status: PaymentStatuses.Succeeded,
      }),
    );
    expect(result.status).toBe(PaymentStatuses.Succeeded);
  });

  it('should update an existing record to failed (idempotent retry)', async () => {
    repo.findOne.mockResolvedValue({
      paymentId: outcome.paymentId,
      status: PaymentStatuses.Pending,
    });

    const result = await service.applyWebhookResult({
      ...outcome,
      succeeded: false,
    });

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: PaymentStatuses.Failed }),
    );
    expect(result.status).toBe(PaymentStatuses.Failed);
  });

  it('should look up payments by gateway reference', async () => {
    await service.findByPaymentId(outcome.paymentId);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { paymentId: outcome.paymentId },
    });
  });
});
