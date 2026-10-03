import { MockPaymentGateway } from './payment.gateway';

describe('MockPaymentGateway', () => {
  let gateway: MockPaymentGateway;

  beforeEach(() => {
    gateway = new MockPaymentGateway();
  });

  describe('initiatePayment', () => {
    it('should create a payment session bound to the order id and amount', async () => {
      const session = await gateway.initiatePayment(
        '123e4567-e89b-12d3-a456-426614174000',
        250000,
      );

      expect(session.paymentId).toBe('MOCK-123E4567-250000');
      expect(session.paymentUrl).toContain(`paymentId=${session.paymentId}`);
      expect(session.paymentUrl).toContain('amount=250000');
    });
  });

  describe('verifyPayment', () => {
    it('should verify a payment whose recorded amount matches the order total', async () => {
      const session = await gateway.initiatePayment(
        '123e4567-e89b-12d3-a456-426614174000',
        250000,
      );

      const result = await gateway.verifyPayment(session.paymentId, 250000);

      expect(result.verified).toBe(true);
      expect(result.amount).toBe(250000);
    });

    it('should reject verification when the amount does not match', async () => {
      const result = await gateway.verifyPayment('MOCK-123E4567-250000', 999);

      expect(result.verified).toBe(false);
      expect(result.reason).toContain('amount does not match');
    });

    it('should reject payments rejected by the gateway (`fail` prefix)', async () => {
      const result = await gateway.verifyPayment('fail-MOCK-123E4567-250000', 250000);

      expect(result.verified).toBe(false);
      expect(result.reason).toContain('rejected by the gateway');
    });

    it('should reject unknown payment references', async () => {
      const result = await gateway.verifyPayment('UNKNOWN-REF-123', 250000);

      expect(result.verified).toBe(false);
      expect(result.reason).toContain('Unknown payment reference');
    });

    it('should throw when no payment reference is provided', async () => {
      await expect(gateway.verifyPayment('', 250000)).rejects.toThrow(
        'Payment reference is required.',
      );
    });
  });
});
