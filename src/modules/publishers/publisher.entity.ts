import { BaseEntity } from 'src/common/base.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToMany, OneToOne, Unique } from 'typeorm';
import { Blog } from '../blogs/blog.entity';

@Entity('publishers')
@Index(['slug'], { unique: true })
@Unique('PUBLISHER_NAME_UNIQUE', ['publisherName'])
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
    type: 'text',
    nullable: true,
  })
  logoUrl?: string;

  @Column({ default: 0 })
  views: number;

  @Column('uuid')
  userId: string;
  @OneToOne(() => User, (user) => user.publisher)
  @JoinColumn()
  user: User;

  @OneToMany(() => Book, (book) => book.publisher)
  books?: Book[];

  @OneToMany(() => Blog, (blog) => blog.publisher)
  blogs?: Blog[];
}
