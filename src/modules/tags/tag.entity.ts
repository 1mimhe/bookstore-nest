import { BaseEntity } from 'src/common/entities/base.entity';
import { Title } from 'src/modules/books/entities/title.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, Unique } from 'typeorm';
import { Blog } from '../blogs/blog.entity';

export enum TagType {
  ThematicCategory = 'thematic_category',
  StoryType = 'story_type',
  FeaturedBooks = 'featured_books',
  LiteratureAward = 'literature_award',
  NationLiterature = 'nation_literature',
  SystemTags = 'system_tags'
}

@Entity('tags')
@Unique('TAG_NAME', ['name'])
@Index(['slug'], { unique: true })
export class Tag extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  description?: string;  

  @Column({
    type: 'enum',
    enum: TagType
  })
  type: TagType;

  @Column({ nullable: true })
  color?: string;
  
  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Title, (title) => title.tags)
  @JoinTable({
    name: 'title_tag',
    joinColumn: { name: 'tagId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'titleId', referencedColumnName: 'id' }
  })
  titles: Title[];

  @ManyToMany(() => Blog, (blog) => blog.tags)
  @JoinTable({
    name: 'blog_tag',
    joinColumn: { name: 'tagId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'blogId', referencedColumnName: 'id' }
  })
  blogs: Blog[];
}