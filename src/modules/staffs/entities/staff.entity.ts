import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, OneToOne } from 'typeorm';

@Entity('staffs')
@Index(['user'], )
export class Staff extends BaseEntity {
  @Column('uuid')
  userId: string;
  @OneToOne(() => User, (user) => user.staff)
  user: User;

  @Column()
  employeeId: string;

  @Column('bigint', { default: 0 })
  salary: bigint;

  @Column({ default: true })
  isActive: boolean;
}