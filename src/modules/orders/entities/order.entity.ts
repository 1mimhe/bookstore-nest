import { BaseEntity } from 'src/common/base.entity';
import { Address } from 'src/modules/users/entities/address.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { OrderBook } from './order-book.entity';
import { Ticket } from 'src/modules/tickets/ticket.entity';

export enum PaymentStatuses {
  Pending = 'pending',
  Paid = 'paid',
  Unpaid = 'unpaid'
}

export enum OrderStatuses {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Returned = 'returned',
  Canceled = 'canceled'
}

export enum ShippingTypes {
  Post = 'post',
  Peyk = 'peyk', // Just for Tehran
  Tipax = 'tipax'
}

@Entity('orders')
export class Order extends BaseEntity {
  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn()
  user: User;

  @Column('uuid')
  shippingAddressId: string;
  @ManyToOne(() => Address, (address) => address.orders)
  @JoinColumn()
  shippingAddress: Address;

  @Column({
    type: 'enum',
    enum: PaymentStatuses,
    default: PaymentStatuses.Pending
  })
  paymentStatus: PaymentStatuses;

  @Column({
    type: 'enum',
    enum: OrderStatuses,
    default: OrderStatuses.Pending
  })
  orderStatus: OrderStatuses;

  @Column({
    type: 'enum',
    enum: ShippingTypes
  })
  shippingType: ShippingTypes;

  @Column('int', { default: 0 })
  shippingPrice: number;

  @Column({ nullable: true })
  discountCode?: string;

  @Column('int')
  totalPrice: number; // Without apply the discount code and shipping price

  @Column('int')
  discountAmount: number;

  @Column('int')
  finalPrice: number;

  @Column({ nullable: true })
  paymentId: string;

  @Column({ nullable: true })
  trackingCode: string;

  @OneToMany(() => OrderBook, (orderBook) => orderBook.order, { cascade: true })
  orderBooks: OrderBook[];

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];
}