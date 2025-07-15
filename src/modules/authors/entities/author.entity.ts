import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Title } from 'src/modules/books/entities/title.entity';
import { Column, Entity, Index, JoinTable, ManyToMany, Unique } from 'typeorm';

@Entity()
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
    name: 'book_authors',
    joinColumn: { name: 'bookId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'authorId', referencedColumnName: 'id' },
  })
  titles: Title[];

  @ManyToMany(() => Book, (book) => book.translators)
  @JoinTable({
    name: 'book_translators',
    joinColumn: { name: 'bookId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'translatorId', referencedColumnName: 'id' },
  })
  books: Book[];
}
