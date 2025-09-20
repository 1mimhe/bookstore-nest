import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique, JoinColumn } from 'typeorm';
import { CollectionBook } from './collection-book.entity';
import { User } from '../../users/entities/user.entity';

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

  @Column({ default: 0 })
  views: number;

  @Column({ default: true })
  isPublic: boolean;

  @Column({ nullable: true })
  userId?: string;
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user?: User;
}