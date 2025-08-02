import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review, ReviewableType } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>
  ) {}

  async create(
    reviewableType: ReviewableType,
    reviewableId: string,
    reviewDto: CreateReviewDto
  ): Promise<Review | never> {
    const review = this.reviewRepo.create({
      reviewableType,
      reviewableId,
      ...reviewDto
    });
    return this.reviewRepo.save(review);
  }
}
