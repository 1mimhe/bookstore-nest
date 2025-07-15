import { BaseEntity } from 'src/common/entities/base.entity';
import { Author } from 'src/modules/authors/entities/author.entity';
import { Column, Entity, Index, ManyToMany, OneToMany } from 'typeorm';
import { Book } from './book.entity';

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
}
