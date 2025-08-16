import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Order } from 'src/modules/orders/entities/order.entity';

@Entity('addresses')
@Index(['user'])
export class Address extends BaseEntity {
  @Column()
  recipientName: string;

  @Column()
  phoneNumber: string;

  @Column({ default: 'Iran '})
  country: string;

  @Column()
  province: string;

  @Column()
  city: string;

  @Column('text')
  postalAddress: string;

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  plate?: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn()
  user: User;

  @OneToMany(() => Order, (order) => order.shippingAddress)
  orders: Order[];
}