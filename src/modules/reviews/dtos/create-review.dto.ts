import { profanity } from '@2toad/profanity';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

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

  @IsOptional()
  @IsUUID()
  parentReviewId?: string;
}

export class CreateBookReviewDto extends CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  bookId: string;
}

export class CreateBlogReviewDto extends CreateReviewDto {
  @IsNotEmpty()
  @IsUUID()
  blogId: string;
}
