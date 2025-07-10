import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity()
@Index(['slug'], { unique: true })
export class Author extends BaseEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true
  })
  biography?: string;

  @Column({ nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  dateOfDeath?: Date;
}
