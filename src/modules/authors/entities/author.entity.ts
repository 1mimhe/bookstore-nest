import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Unique } from 'typeorm';

@Entity()
@Unique(['slug'])
export class Author extends BaseEntity {
  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: false })
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
