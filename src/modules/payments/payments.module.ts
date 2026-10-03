import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockPaymentGateway, PAYMENT_GATEWAY } from './payment.gateway';

/**
 * The payments module exposes a provider-agnostic payment gateway behind the
 * `PAYMENT_GATEWAY` injection token. `PAYMENT_PROVIDER` selects the concrete
 * implementation (`mock` today; a real PSP integration later).
 */
@Module({
  providers: [
    {
      provide: PAYMENT_GATEWAY,
      useFactory: (config: ConfigService) => {
        const provider = (
          config.get<string>('PAYMENT_PROVIDER') ?? 'mock'
        ).toLowerCase();
        switch (provider) {
          case 'mock':
          default:
            return new MockPaymentGateway();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [PAYMENT_GATEWAY],
})
export class PaymentsModule {}