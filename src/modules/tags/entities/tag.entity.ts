import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

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

  @ManyToMany(() => Book, (book) => book.tags)
  books: Book[];
}