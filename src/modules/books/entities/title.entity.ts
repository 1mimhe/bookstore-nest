import { BaseEntity } from 'src/common/entities/base.entity';
import { Author } from 'src/modules/authors/author.entity';
import { Column, Entity, Index, ManyToMany, OneToMany } from 'typeorm';
import { Book } from './book.entity';
import { Tag } from 'src/modules/tags/tag.entity';
import { Blog } from 'src/modules/blogs/blog.entity';
import { Quote } from './quote.entity';
import { Feature } from './feature.entity';
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

  @OneToMany(() => Quote, (quote) => quote.title, { cascade: true })
  quotes: Quote[];

  @OneToMany(() => Feature, (feature) => feature.title, { cascade: true })
  features: Feature[];

  @ManyToMany(() => Character, (character) => character.titles)
  characters: Character[];
}
