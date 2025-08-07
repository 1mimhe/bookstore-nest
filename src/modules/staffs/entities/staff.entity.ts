import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { StaffAction } from './staff-action.entity';
import { StaffSession } from './staff-session.entity';

@Entity('staffs')
@Index(['user'], )
export class Staff extends BaseEntity {
  @Column('uuid')
  userId: string;
  @OneToOne(() => User, (user) => user.staff)
  @JoinColumn()
  user: User;

  @Column()
  employeeId: string;

  @Column('bigint', { default: 0 })
  salary: bigint;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StaffAction, (action) => action.staff)
  actions: StaffAction[];

  @OneToMany(() => StaffSession, (session) => session.staff)
  sessions: StaffSession[];
}