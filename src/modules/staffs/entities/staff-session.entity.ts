import { BaseEntity } from 'src/common/entities/base.entity';
import { Staff } from './staff.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('staff_sessions')
export class StaffSession extends BaseEntity {
  @Column('uuid')
  staffId: string;
  @ManyToOne(() => Staff, (staff) => staff.actions)
  @JoinColumn()
  staff: Staff;

  @Column({ nullable: true })
  logoutAt?: Date;

  @Column({ default: Date.now() })
  lastActivityAt: Date;
}