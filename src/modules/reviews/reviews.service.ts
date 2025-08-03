import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review, ReviewableType } from './entities/review.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>
  ) {}

  async create(
    userId: string,
    reviewableType: ReviewableType,
    reviewableId: string,
    reviewDto: CreateReviewDto
  ): Promise<Review | never> {
    const entityLike = {
      userId,
      reviewableType,
      ...reviewDto
    } as DeepPartial<Review>;

    switch (reviewableType) {
      case ReviewableType.Book:
        entityLike.bookId = reviewableId;
        break;

      case ReviewableType.Blog:
        entityLike.blogId = reviewableId;
        break;
    }

    const review = this.reviewRepo.create(entityLike);
    return this.reviewRepo.save(review).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }
}
