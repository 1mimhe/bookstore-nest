import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { ReviewReaction } from './review-like.entity';

export enum ReviewableType {
  Book = 'book',
  Blog = 'blog'
}

@Entity('review')
@Index(['user', 'review'])
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

  @Column()
  reviewableId: string; // bookId or blogId

  @ManyToOne(() => User, user => user.reviews, { eager: true })
  user: User;

  @ManyToOne(() => Review, review => review.replies, { nullable: true })
  parentReview: Review;

  @OneToMany(() => Review, review => review.parentReview)
  replies: Review[];

  @OneToMany(() => ReviewReaction, (reviewReaction) => reviewReaction.review)
  likes: ReviewReaction[];

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  repliesCount: number;
}
