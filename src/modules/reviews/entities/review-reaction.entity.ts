import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Review } from './review.entity';
import { User } from 'src/modules/users/entities/user.entity';

export enum ReactionsEnum {
  Like = 'like',
  Dislike = 'dislike',
  Love = 'love',
  Fire = 'fire',
  Tomato = 'tomato'
}

@Entity('review_reactions')
@Index(['review', 'user'], { unique: true })
export class ReviewReaction extends BaseEntity {
  @Column('uuid')
  reviewId: string;
  @ManyToOne(() => Review, review => review.reactions, { onDelete: 'CASCADE' })
  @JoinColumn()
  review: Review;

  @Column('uuid')
  userId: string;
  @ManyToOne(() => User, user => user.reviewReactions)
  @JoinColumn()
  user: User;
  
  @Column({
    type: 'enum',
    enum: ReactionsEnum
  })
  reaction: ReactionsEnum;
}