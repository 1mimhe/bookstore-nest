import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ReactionsEnum } from '../entities/review-reaction.entity'

export class ReactToReviewDto {
  @IsNotEmpty()
  @IsUUID()
  reviewId: string;

  @IsNotEmpty()
  @IsEnum(ReactionsEnum)
  reaction: ReactionsEnum;
}