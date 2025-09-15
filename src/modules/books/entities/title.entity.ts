import { BaseEntity } from 'src/common/base.entity';
import { Author } from 'src/modules/authors/author.entity';
import { Column, Entity, Index, JoinColumn, ManyToMany, OneToMany, OneToOne } from 'typeorm';
import { Book } from './book.entity';
import { Tag } from '../../tags/entities/tag.entity';
import { Blog } from 'src/modules/blogs/blog.entity';
import { Character } from './characters.entity';

@Entity('titles')
@Index(['slug'], { unique: true })
export class Title extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ nullable: true })
  summary?: string;

  @Column({ nullable: true })
  originallyPublishedAt?: Date;

  @ManyToMany(() => Author, (author) => author.titles)
  authors: Author[];

  @OneToMany(() => Book, (book) => book.title)
  books: Book[];

  @ManyToMany(() => Tag, (tag) => tag.titles)
  tags: Tag[];

  @OneToMany(() => Blog, (blog) => blog.title)
  blogs?: Blog[];

  @Column('json')
  features: string[];

  @Column('json')
  quotes: string[];

  @Column({ default: 0 })
  views: number;

  @ManyToMany(() => Character, (character) => character.titles)
  characters: Character[];

  @Column('uuid', { nullable: true })
  defaultBookId?: string;
  @OneToOne(() => Book, (book) => book.title)
  @JoinColumn()
  defaultBook?: Book;
}
