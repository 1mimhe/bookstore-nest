import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Book } from './book.entity';

@Entity('languages')
@Unique(['name'])
export class Language extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Book, (book) => book.language)
  books: Book[];
}
