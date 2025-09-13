import { Column, Entity, Unique } from 'typeorm';
import { ShippingTypes } from './order.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity('shipping_prices')
@Unique(['type'])
export class ShippingPrice extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ShippingTypes
  })
  type: ShippingTypes;

  @Column('int')
  price: number;
}