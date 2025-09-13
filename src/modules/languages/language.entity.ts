import { BaseEntity } from 'src/common/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';

@Entity('languages')
@Unique(['code'])
export class Language extends BaseEntity {
  @Column()
  code: string;

  @Column()
  persianName: string;

  @Column()
  englishName: string;

  @OneToMany(() => Book, (book) => book.language)
  books: Book[];
}
