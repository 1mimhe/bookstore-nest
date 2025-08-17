import { Column, Entity, Unique } from 'typeorm';
import { ShippingTypes } from './order.entity';

@Entity('shipping_prices')
@Unique(['type'])
export class ShippingPrice {
  @Column({
    type: 'enum',
    enum: ShippingTypes
  })
  type: ShippingTypes;

  @Column('int')
  price: number;
}