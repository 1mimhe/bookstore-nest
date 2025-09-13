import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/common/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum BookImageTypes {
  Main = 'main',
  Back = 'back',
  Inside = 'inside',
  Cover = 'cover',
}

@Entity('book_images')
@Index(['book'])
export class BookImage extends BaseEntity {
  @Column({
    type: 'enum',
    enum: BookImageTypes,
  })
  type: BookImageTypes;

  @Column('text')
  url: string;

  @Column('uuid')
  bookId: string;
  @Exclude()
  @ManyToOne(() => Book, (book) => book.images)
  @JoinColumn()
  book: Book;
}