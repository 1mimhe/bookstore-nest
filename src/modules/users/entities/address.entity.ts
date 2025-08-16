import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('addresses')
@Index(['user'])
@Index(['logicalId', 'version'], { unique: true })
export class Address extends BaseEntity {
  @Column('uuid')
  logicalId: string;

  @Column({ default: 1 })
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

  @Column({ nullable: true })
  postalCode?: string;

  @Column({ nullable: true })
  plate?: number;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.addresses)
  @JoinColumn()
  user: User;

  @Column({ default: true })
  isActive: boolean;
}