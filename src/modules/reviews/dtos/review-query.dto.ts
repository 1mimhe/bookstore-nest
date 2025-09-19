import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';

export enum ReviewSortBy {
  Newest = 'newest',
  MostReactions = 'most_reactions',
  MostLiked = 'most_liked',
  MostDisliked = 'most_disliked', 
  MostLoved = 'most_loved',
  MostFire = 'most_fire',
  MostTomato = 'most_tomato',
  MostReplies = 'most_replies',
  HighestRate = 'highest_rate',
  LowestRate = 'lowest_rate'
}

export class ReviewQueryDto {
  @Transform(({ value }) => !value ? value : Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @Transform(({ value }) => !value ? value : Number(value))
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    default: ReviewSortBy.Newest,
    enum: ReviewSortBy
  })
  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy;
}
