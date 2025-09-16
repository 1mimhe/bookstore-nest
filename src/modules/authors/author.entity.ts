import { BaseEntity } from 'src/common/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Title } from 'src/modules/books/entities/title.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, OneToMany, Unique } from 'typeorm';
import { Blog } from '../blogs/blog.entity';

@Entity('authors')
@Index(['slug'], { unique: true })
export class Author extends BaseEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column()
  slug: string;

  @Column('text', { nullable: true })
  picUrl?: string;

  @Column({
    type: 'text',
    nullable: true
  })
  biography?: string;

  @Column({ nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  dateOfDeath?: Date;

  @ManyToMany(() => Title, (title) => title.authors)
  @JoinTable({
    name: 'title_author',
    joinColumn: { name: 'authorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'titleId', referencedColumnName: 'id' },
  })
  titles: Title[];

  @ManyToMany(() => Book, (book) => book.translators)
  @JoinTable({
    name: 'book_translator',
    joinColumn: { name: 'translatorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'bookId', referencedColumnName: 'id' },
  })
  books: Book[];

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs?: Blog[];

  @Column({ default: 0 })
  views: number;
}
