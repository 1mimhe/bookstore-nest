import { profanity } from '@2toad/profanity';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';
import { ReviewableType } from '../entities/review.entity';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 250)
  @Transform(({ obj }) => profanity.censor(obj.content))
  content: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @IsNotEmpty()
  @IsEnum(ReviewableType)
  reviewableType: ReviewableType;

  @IsNotEmpty()
  @IsUUID()
  reviewableId: string;

  @IsOptional()
  @IsUUID()
  parentReviewId?: string;
}
