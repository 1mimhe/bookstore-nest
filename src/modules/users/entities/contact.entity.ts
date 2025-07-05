import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity()
// @Index(['userId'])
@Unique(['phoneNumber'])
@Unique(['email'])
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
