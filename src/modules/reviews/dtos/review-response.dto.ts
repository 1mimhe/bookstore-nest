import { Expose, Type } from 'class-transformer';
import { ReactionsEnum } from '../entities/review-reaction.entity';
import { ApiProperty } from '@nestjs/swagger';
import { BookCompactResponseDto } from 'src/modules/books/dtos/book-response.dto';
import { ReviewableType } from '../entities/review.entity';
import { RolesEnum } from 'src/modules/users/entities/role.entity';

class UserDto {
  @Expose()
  username: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @ApiProperty({
    examples: [RolesEnum.Customer, RolesEnum.Admin]
  })
  @Expose()
  role: RolesEnum.Customer | RolesEnum.Admin;
}

export class ReviewResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  reviewableType: ReviewableType;

  @Expose()
  reviewableId: string;

  @Expose()
  @Type(() => BookCompactResponseDto)
  book?: BookCompactResponseDto;
  
  @Expose()
  content: string;
  
  @Expose()
  rate: number;
  
  @Expose()
  likeCount: number;
  
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

  @ApiProperty({ enum: ReactionsEnum })
  @Expose()
  userReaction: ReactionsEnum;

  @Expose()
  @Type(() => ReviewResponseDto)
  replies: ReviewResponseDto[];

  @Expose()
  idEdited: boolean;

  @Expose()
  createdAt: Date;
  
  @Expose()
  updatedAt: Date;
  
  @Expose()
  deletedAt?: Date;
}

export class ReviewResponseWithCountDto {
  @Expose()
  count: number;

  @Type(() => ReviewResponseDto)
  @Expose()
  reviews: ReviewResponseDto[];
}

export class ReviewsResponseDto {
  @Expose()
  @Type(() => ReviewResponseDto)
  reviews: ReviewResponseDto[];

  @Expose()
  totalReviews: number;
  
  @Expose()
  totalReviewPages: number;
}