import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  @Max(250)
  content: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rate: number;

  @IsNotEmpty()
  @IsUUID()
  parentReviewId: string;
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
