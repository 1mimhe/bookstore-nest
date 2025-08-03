import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ReviewReaction } from './review-reaction.entity';
import { Book } from 'src/modules/books/entities/book.entity';
import { Blog } from 'src/modules/blogs/blog.entity';

export enum ReviewableType {
  Book = 'book',
  Blog = 'blog'
}

@Entity('reviews')
@Index(['user'])
export class Review extends BaseEntity {
  @Column('text')
  content: string;

  @Column('tinyint')
  rate: number;

  @Column({
    type: 'enum',
    enum: ReviewableType
  })
  reviewableType: ReviewableType;

  @Column({
    type: 'uuid',
    nullable: true
  })
  bookId?: string;
  @ManyToOne(() => Book, (book) => book.reviews)
  book?: Book;

  @Column({
    type: 'uuid',
    nullable: true
  })
  blogId?: string;
  @ManyToOne(() => Blog, (blog) => blog.reviews)
  blog?: Blog;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, user => user.reviews, { eager: true })
  user: User;

  @Column({
    type: 'uuid',
    nullable: true
  })
  parentReviewId?: string;
  @ManyToOne(() => Review, review => review.replies, { nullable: true })
  parentReview?: Review;

  @OneToMany(() => Review, review => review.parentReview)
  replies: Review[];

  @Column({ default: 0 })
  repliesCount: number;

  @OneToMany(() => ReviewReaction, (reviewReaction) => reviewReaction.review)
  reactions: ReviewReaction[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @Column({ default: 0 })
  loveCount: number;
  
  @Column({ default: 0 })
  fireCount: number;
  
  @Column({ default: 0 })
  tomatoCount: number;
}
