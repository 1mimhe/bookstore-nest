import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum TicketTypes {
  BookRequest = 'book_request',
  Complaint = 'complaint',
  GeneralInquiry = 'general_inquiry',
  TechnicalSupport = 'technical_support',
  RefundRequest = 'refund_request',
  Other = 'other',
}

export enum TicketStatuses {
  Open = 'open',
  Closed = 'closed',
}

@Entity('tickets')
@Index(['user'])
@Index(['status'])
@Index(['type'])
export class Ticket extends BaseEntity {
  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.tickets)
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: TicketTypes,
  })
  type: TicketTypes;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  response?: string;

  @Column({
    type: 'enum',
    enum: TicketStatuses,
    default: TicketStatuses.Open,
  })
  status: TicketStatuses;

  @Column('uuid', { nullable: true })
  orderId?: string;
  @ManyToOne(() => Order, (order) => order.tickets, { nullable: true })
  @JoinColumn()
  order?: Order;

  @Column({ nullable: true })
  subject?: string;
}