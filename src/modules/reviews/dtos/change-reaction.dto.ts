import { IsEnum, IsNotEmpty } from 'class-validator';
import { ReactionsEnum } from '../entities/review-reaction.entity';

export class ChangeReactionDto {
  @IsNotEmpty()
  @IsEnum(ReactionsEnum)
  reaction: ReactionsEnum;
}