import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Entity('languages')
@Unique(['name'])
export class Language extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Book, (book) => book.language)
  books: Book[];
}
