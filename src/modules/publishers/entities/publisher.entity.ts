import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm';

@Entity()
@Index(['slug'], { unique: true })
@Unique(['publisherName'])
export class Publisher extends BaseEntity {
  @Column()
  publisherName: string;
  
  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @OneToOne(() => User, (user) => user.publisher)
  @JoinColumn()
  user: User;
}
