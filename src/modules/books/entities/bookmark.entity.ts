import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Book } from './book.entity';

export enum BookmarkTypes {
  Read = 'read',
  Loved = 'loved',
  Library = 'library',
}

@Entity('bookmarks')
@Unique('BOOKMARK_UNIQUE', ['user', 'book', 'type'])
export class Bookmark extends BaseEntity {
  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, (user) => user.bookmarks)
  @JoinColumn()
  user: User;

  @Column('uuid')
  bookId: string;
  @ManyToOne(() => Book, (book) => book.bookmarks, { onDelete: 'CASCADE' })
  book: Book;

  @Column({
    type: 'enum',
    enum: BookmarkTypes,
    default: BookmarkTypes.Library
  })
  type: BookmarkTypes;
}