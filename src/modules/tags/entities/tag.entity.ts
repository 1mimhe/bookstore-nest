import { BaseEntity } from 'src/common/entities/base.entity';
import { Title } from 'src/modules/books/entities/title.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

export enum TagType {
  ThematicCategory = 'thematic_category',
  StoryType = 'story_type',
  FeaturedBooks = 'featured_books',
  LiteratureAward = 'literature_award',
  NationLiterature = 'nation_literature',
  SystemTags = 'system_tags'
}

@Entity('tags')
export class Tag extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TagType
  })
  type: TagType;
  
  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Title, (title) => title.tags)
  @JoinTable({
    name: 'title_tag',
    joinColumn: { name: 'titleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' }
  })
  titles: Title[];
}