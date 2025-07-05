import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
// @Index(['userId'])
export class Contact extends BaseEntity {
  @Column()
  phoneNumber: string;

  @Column({ default: false })
  isVerifiedPhoneNumber: boolean;

  @Column()
  email: string;

  @Column({ default: false })
  isVerifiedEmail: boolean;

  @OneToOne(() => User, (user) => user.contact)
  @JoinColumn()
  user: User;
}
