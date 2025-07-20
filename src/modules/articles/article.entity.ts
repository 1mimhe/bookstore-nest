import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { Publisher } from '../publishers/publisher.entity';
import { Author } from '../authors/author.entity';
import { Title } from '../books/entities/title.entity';
import { Tag } from '../tags/tag.entity';

@Index(['titleId'])
@Index(['authorId'])
@Index(['publisherId'])
@Entity()
export class Article extends BaseEntity {
  @Column('varchar')
  subject: string;

  @Column('text')
  summary: string;

  @Column('text')
  content: string;

  @Index()
  @Column('uuid')
  titleId: string;

  @Index()
  @Column('uuid')
  authorId: string;

  @Index()
  @Column('uuid')
  publisherId: string;

  @ManyToOne(() => Title)
  @JoinColumn({ name: 'titleId' })
  title: Title;

  @ManyToOne(() => Author)
  @JoinColumn({ name: 'authorId' })
  author: Author;

  @ManyToOne(() => Publisher)
  @JoinColumn({ name: 'publisherId' })
  publisher: Publisher;

  @ManyToMany(() => Tag, (tag) => tag.articles)
  tags: Tag[];
}
