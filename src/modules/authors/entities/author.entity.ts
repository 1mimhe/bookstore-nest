import { BaseEntity } from 'src/common/entities/base.entity';
import { Title } from 'src/modules/books/entities/title.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, Unique } from 'typeorm';

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

  @ManyToMany(() => Title, (title) => title.authors)
  @JoinTable()
  titles: Title[];
}
