import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

export enum Roles {
  Customer = 'customer',
  Admin = 'admin',
  ContentManager = 'content_manager',
  InventoryManager = 'inventory_manager',
  OrderManager = 'order_manager',
  Publisher = 'publisher',
}

@Entity('roles')
@Index(['user', 'role'])
export class Role extends BaseEntity {
  @Column({
    type: 'enum',
    enum: Roles,
  })
  role: Roles;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn()
  user: User;
}
