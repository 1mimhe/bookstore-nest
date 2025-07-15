import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('contacts')
@Index(['user'])
@Index(['phoneNumber'], { unique: true })
@Index(['email'], { unique: true })
export class Contact extends BaseEntity {
  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isVerifiedPhoneNumber: boolean;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isVerifiedEmail: boolean;

  @OneToOne(() => User, (user) => user.contact)
  @JoinColumn()
  user: User;
}
