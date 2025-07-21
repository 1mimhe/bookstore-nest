import { BaseEntity } from 'src/common/entities/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { Blog } from '../blogs/blog.entity';

@Entity('publishers')
@Index(['slug'], { unique: true })
@Unique(['publisherName'])
export class Publisher extends BaseEntity {
  @Column()
  publisherName: string;

  @Column()
  slug: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    nullable: true,
    type: 'text'
  })
  logoUrl?: string;

  @Column()
  userId: string;
  @OneToOne(() => User, (user) => user.publisher)
  @JoinColumn()
  user: User;

  @OneToMany(() => Book, (book) => book.publisher)
  books: Book[];

  @OneToMany(() => Blog, (blog) => blog.publisher)
  blogs?: Blog[];
}
