import { Expose, Type } from 'class-transformer';

class UserDto {
  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}

export class ReviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
  
  @Expose()
  content: string;
  
  @Expose()
  rate: number;
  
  @Expose()
  likesCount: number;
  
  @Expose()
  dislikeCount: number;
  
  @Expose()
  loveCount: number;
  
  @Expose()
  fireCount: number;
  
  @Expose()
  tomatoCount: number;
  
  @Expose()
  repliesCount: number;

  @Expose()
  @Type(() => ReviewResponseDto)
  replies: ReviewResponseDto[];

  @Expose()
  createdAt: Date;
  
  @Expose()
  updatedAt: Date;
  
  @Expose()
  deletedAt?: Date;
}

export class BookReviewResponseDto extends ReviewResponseDto {
  @Expose()
  bookId?: string;
}

export class BlogReviewResponseDto extends ReviewResponseDto {
  @Expose()
  blogId?: string;
}

export class GetBookReviewsResponseDto {
  @Expose()
  @Type(() => BookReviewResponseDto)
  reviews: BookReviewResponseDto[];

  @Expose()
  totalReviews: number;
  
  @Expose()
  totalReviewPages: number;
}

export class GetBlogReviewsResponseDto {
  @Expose()
  @Type(() => BlogReviewResponseDto)
  reviews: BlogReviewResponseDto[];

  @Expose()
  totalReviews: number;
  
  @Expose()
  totalReviewPages: number;
}