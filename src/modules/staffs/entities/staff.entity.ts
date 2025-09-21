import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { StaffAction } from './staff-action.entity';
import { Ticket } from 'src/modules/tickets/ticket.entity';

@Entity('staffs')
@Index(['user'], { unique: true })
@Unique('NATIONAL_ID_UNIQUE', ['nationalId'])
export class Staff extends BaseEntity {
  @Column('uuid')
  userId: string;
  @OneToOne(() => User, (user) => user.staff)
  @JoinColumn()
  user: User;

  @Column()
  nationalId: string;

  @Column()
  employeeId: string;

  @Column('bigint', { default: 0 })
  salary: bigint;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StaffAction, (action) => action.staff)
  actions: StaffAction[];

  @OneToMany(() => Ticket, (ticket) => ticket.staff)
  tickets: Ticket[];
}