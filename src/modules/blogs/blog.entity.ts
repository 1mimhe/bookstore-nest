import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Publisher } from '../publishers/publisher.entity';
import { Author } from '../authors/author.entity';
import { Title } from '../books/entities/title.entity';
import { Tag } from '../tags/tag.entity';
import { Review } from '../reviews/entities/review.entity';

@Entity('blogs')
@Index('BLOG_TITLE_INDEX', ['titleId'])
@Index('BLOG_AUTHOR_INDEX', ['authorId'])
@Index('BLOG_PUBLISHER_INDEX', ['publisherId'])
@Index(['slug'], { unique: true })
export class Blog extends BaseEntity {
  @Column()
  subject: string;

  @Column({ nullable: true })
  otherSubject?: string;

  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  summary?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  picUrl?: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  isPublic: boolean;

  @Index()
  @Column({
    type: 'uuid',
    nullable: true
  })
  titleId?: string;

  @Index()
  @Column({
    type: 'uuid',
    nullable: true
  })
  authorId?: string;

  @Index()
  @Column({
    type: 'uuid',
    nullable: true
  })
  publisherId?: string;

  @ManyToOne(() => Title, (title) => title.blogs)
  @JoinColumn()
  title?: Title;

  @ManyToOne(() => Author, (author) => author.blogs)
  @JoinColumn()
  author?: Author;

  @ManyToOne(() => Publisher, (publisher) => publisher.blogs)
  @JoinColumn()
  publisher?: Publisher;

  @ManyToMany(() => Tag, (tag) => tag.blogs)
  tags: Tag[];

  @OneToMany(() => Review, (review) => review.book)
  reviews: Review[];
}
