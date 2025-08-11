import { profanity } from '@2toad/profanity';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  @Length(3, 250)
  @Transform(({ obj }) => profanity.censor(obj.content))
  content?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rate?: number;
}
