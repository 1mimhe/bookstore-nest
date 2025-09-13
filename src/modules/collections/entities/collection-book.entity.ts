import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Collection } from './collection.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity('collection_book')
@Index(['collection'])
@Unique('COLLECTION_BOOK_UNIQUE',['collection', 'book'])
export class CollectionBook extends BaseEntity {
  @Column('uuid')
  collectionId: string;
  @ManyToOne(() => Collection, (collection) => collection.collectionBooks)
  @JoinColumn()
  collection: Collection;

  @Column('uuid')
  bookId: string;
  @ManyToOne(() => Book, (book) => book.collectionBooks)
  @JoinColumn()
  book: Book;

  @Column('smallint')
  order: number;

  @Column({ nullable: true })
  description?: string;
}