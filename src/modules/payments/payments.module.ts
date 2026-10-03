import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MockPaymentGateway, PAYMENT_GATEWAY } from './payment.gateway';
import { Payment } from './entities/payment.entity';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';

/**
 * The payments module exposes a provider-agnostic payment gateway behind the
 * `PAYMENT_GATEWAY` injection token. `PAYMENT_PROVIDER` selects the concrete
 * implementation (`mock` today; a real PSP integration later).
 *
 * `PaymentsService` persists the auditable payment history (including async
 * webhook outcomes); the pull-based gateway stays untouched so order logic
 * never depends on push delivery.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
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
    PaymentsService,
  ],
  exports: [PAYMENT_GATEWAY, PaymentsService],
})
export class PaymentsModule {}
