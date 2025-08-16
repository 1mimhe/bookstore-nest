import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
@Index(['user'])
export class Address extends BaseEntity {
  @PrimaryColumn()
  version: number;

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

  @Column()
  postalCode: string;

  @Column()
  plate: number;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn()
  user: User;
}