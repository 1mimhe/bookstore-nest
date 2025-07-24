import { BaseEntity } from 'src/common/entities/base.entity';
import { Publisher } from 'src/modules/publishers/publisher.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { Title } from './title.entity';
import { Author } from 'src/modules/authors/author.entity';
import { BookImage } from './book-image.entity';
import { Language } from 'src/modules/languages/language.entity';

export enum Quartos {
  Vaziri = 'vaziri',
  Roqee = 'roqee',
  Jibi = 'jibi',
  Rahli = 'rahli',
  Kheshti = 'kheshti',
  Paltoyi = 'paltoyi',
  Sultani = 'sultani',
}

export enum Covers {
  Shoomiz = 'shoomiz',
  Kaqazi = 'kaqazi',
  Sakht = 'sakht',
  Charmi = 'charmi',
}

@Entity('books')
// @Unique('TITLE_PUBLISHER_UNIQUE', ['title', 'publisher'])
@Unique('ISBN_UNIQUE', ['ISBN'])
@Index(['title'])
@Index(['publisher'])
export class Book extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  anotherName?: string;

  @Column({ nullable: true })
  ISBN?: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Quartos,
  })
  quarto?: Quartos;

  @Column({
    nullable: true,
    type: 'enum',
    enum: Covers,
  })
  cover?: Covers;

  @Column({
    nullable: true,
    type: 'int',
  })
  pagesNumber?: number;

  @Column({ nullable: true })
  publishedAt?: Date;

  @Column({
    nullable: true,
    type: 'int',
  })
  publishSeries?: number;

  @Column({
    nullable: true,
    type: 'int', // in gr
  })
  weight?: number;

  @Column({
    nullable: true,
    type: 'int',
    default: 0,
  })
  stock?: number;

  @Column('int')
  price: number;

  @Column({
    nullable: true,
    type: 'float', // 0-1
    default: 0,
  })
  discountPercent?: number;

  @Column({
    nullable: true,
    type: 'int',
    default: 0,
  })
  sold?: number;

  @Column('uuid')
  titleId: string;
  @ManyToOne(() => Title, (title) => title.books)
  @JoinColumn()
  title: Title;

  @Column('uuid')
  publisherId: string;
  @ManyToOne(() => Publisher, (publisher) => publisher.books)
  @JoinColumn({ name: 'publisherId' })
  publisher: Publisher;

  @ManyToMany(() => Author, (author) => author.books)
  translators: Author[];

  @Column('uuid')
  languageId: string;
  @ManyToOne(() => Language, (language) => language.books)
  @JoinColumn()
  language: Language;

  @OneToMany(() => BookImage, (image) =>  image.book, { cascade: true })
  images: BookImage[];
}
