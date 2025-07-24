import { BaseEntity, Column, Entity, JoinTable, ManyToMany, Unique } from 'typeorm';
import { Title } from './title.entity';

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