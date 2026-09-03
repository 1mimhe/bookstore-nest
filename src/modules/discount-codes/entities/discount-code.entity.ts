import { BaseEntity } from 'src/common/base.entity';
import {
  Column,
  Entity,
  ManyToMany,
  JoinTable,
  Unique,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

export enum DiscountCodeType {
  Percentage = 'percentage',
  FixedAmount = 'fixedAmount',
}

@Entity('discount_codes')
@Unique('CODE_UNIQUE', ['code'])
export class DiscountCode extends BaseEntity {
  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountCodeType,
  })
  type: DiscountCodeType;

  @Column('float')
  value: number;

  @Column('float', { nullable: true })
  minPurchase?: number;

  @Column('float', { nullable: true })
  maxPurchase?: number;

  @Column({ type: 'datetime', nullable: true })
  startDate?: Date;

  @Column({ type: 'datetime', nullable: true })
  endDate?: Date;

  @Column('int', { default: 0 })
  usedCount: number;

  @Column('int', { nullable: true })
  usageLimit?: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.discountCodes)
  @JoinTable({
    name: 'user_discount_codes',
    joinColumn: {
      name: 'discountCodeId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  users: User[];
}
