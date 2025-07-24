import { Column, Entity, JoinTable, ManyToMany, Unique } from 'typeorm';
import { Title } from './title.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('characters')
@Unique(['slug'])
export class Character extends BaseEntity {
  @Column()
  fullName: string;

  @Column({ nullable: true })
  nickName?: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  biography?: string;

  @Column({ nullable: true })
  picUrl?: string;

  @ManyToMany(() => Title, (title) => title.characters)
  @JoinTable({
    name: 'title_character',
    joinColumn: { name: 'characterId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'titleId', referencedColumnName: 'id' }
  })
  titles: Title[];
}