import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { CollectionBook } from './collection-book.entity';

@Entity()
export class Collection extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @OneToMany(() => CollectionBook, (collectionBook) => collectionBook.collection)
  collectionBooks: CollectionBook[];
}