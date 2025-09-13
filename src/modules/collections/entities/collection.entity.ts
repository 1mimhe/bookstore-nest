import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { CollectionBook } from './collection-book.entity';

@Entity()
@Unique(['slug'])
export class Collection extends BaseEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @OneToMany(() => CollectionBook, (collectionBook) => collectionBook.collection)
  collectionBooks: CollectionBook[];
}