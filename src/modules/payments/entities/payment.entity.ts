import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, Index } from 'typeorm';

export enum PaymentStatuses {
  Pending = 'pending',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

export enum PaymentProviders {
  Mock = 'mock',
}

@Entity('payments')
export class Payment extends BaseEntity {
  @Index({ unique: true })
  @Column()
  paymentId: string;

  @Index()
  @Column('uuid')
  orderId: string;

  @Column('int')
  amount: number;

  @Column({ default: PaymentProviders.Mock })
  provider: string;

  @Column({
    type: 'enum',
    enum: PaymentStatuses,
    default: PaymentStatuses.Pending,
  })
  status: PaymentStatuses;

  @Column({ type: 'json', nullable: true })
  rawPayload?: Record<string, unknown> | null;
}
