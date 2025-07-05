import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum Roles {
  Customer = 'customer',
  Admin = 'admin',
  ContentManager = 'content-manager',
  InventoryManager = 'inventory-manager',
  OrderManager = 'order-manager',
  Publisher = 'publisher',
}


@Entity()
// @Index(['userId'])
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: Roles,
  })
  role: string;

  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn()
  user: User;
}
