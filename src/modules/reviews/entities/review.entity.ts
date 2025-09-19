import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ReactionsEnum, ReviewReaction } from './review-reaction.entity';
import { Book } from 'src/modules/books/entities/book.entity';

export enum ReviewableType {
  Book = 'book',
  Blog = 'blog',
  Author = 'author',
  Publisher = 'publisher'
}

@Entity('reviews')
@Index(['user'])
@Index(['reviewableType', 'reviewableId'])
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

  @Column('uuid')
  reviewableId: string;

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

  @OneToMany(() => Review, review => review.parentReview, { onDelete: 'CASCADE' })
  replies: Review[];

  @Column({ default: 0 })
  repliesCount: number;

  @OneToMany(() => ReviewReaction, (reviewReaction) => reviewReaction.review)
  reactions: ReviewReaction[];

  userReaction?: ReactionsEnum;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  dislikeCount: number;

  @Column({ default: 0 })
  loveCount: number;
  
  @Column({ default: 0 })
  fireCount: number;
  
  @Column({ default: 0 })
  tomatoCount: number;

  @Column('boolean', {
    default: false
  })
  isEdited: boolean;
}
