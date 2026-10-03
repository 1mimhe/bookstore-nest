import { Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Contract every payment provider must implement. The orders module depends
 * only on this abstraction, so a real gateway (e.g. Zarinpal, Stripe) can be
 * plugged in without touching order business logic.
 */
export interface PaymentGateway {
  /** Create a payment session for the given amount and return its reference. */
  initiatePayment(orderId: string, amount: number): Promise<PaymentSession>;
  /**
   * Verify server-side that a payment actually succeeded for the given amount.
   * Implementations MUST NOT trust client-provided status flags.
   */
  verifyPayment(paymentId: string, amount: number): Promise<PaymentVerificationResult>;
}

export interface PaymentSession {
  paymentId: string;
  /** Absolute URL the client should be redirected to for completing payment. */
  paymentUrl: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  amount?: number;
  reason?: string;
}

/**
 * Deterministic sandbox gateway used for development, testing and portfolio
 * review. Payment references prefixed with `fail` simulate a rejected
 * transaction so the whole failure path is exercisable without a real gateway.
 */
@Injectable()
export class MockPaymentGateway implements PaymentGateway {
  initiatePayment(orderId: string, amount: number): Promise<PaymentSession> {
    const paymentId = `MOCK-${orderId.slice(0, 8).toUpperCase()}-${amount}`;
    return Promise.resolve({
      paymentId,
      paymentUrl: `/payments/mock/checkout?paymentId=${paymentId}&amount=${amount}`,
    });
  }

  async verifyPayment(paymentId: string, amount: number): Promise<PaymentVerificationResult> {
    if (!paymentId || typeof paymentId !== 'string') {
      throw new UnauthorizedException('Payment reference is required.');
    }

    if (paymentId.startsWith('fail')) {
      return { verified: false, reason: 'Payment was rejected by the gateway.' };
    }

    const expectedPrefix = 'MOCK-';
    if (!paymentId.startsWith(expectedPrefix)) {
      return { verified: false, reason: 'Unknown payment reference.' };
    }

    const recordedAmount = Number(paymentId.split('-').pop());
    if (Number.isNaN(recordedAmount) || recordedAmount !== amount) {
      return {
        verified: false,
        reason: 'Payment amount does not match the order total.',
      };
    }

    return { verified: true, amount: recordedAmount };
  }
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');