import { Body, Controller, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateBookReviewDto } from './dtos/create-review.dto';
import { ReviewableType } from './entities/review.entity';
import { ApiOperation } from '@nestjs/swagger';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Create a review for a book'
  })
  @Post('books')
  async createBookReview(@Body() body: CreateBookReviewDto) {
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(ReviewableType.Book, bookId, reviewDto);
  }

  @ApiOperation({
    summary: 'Create a review for a blog'
  })
  @Post('blogs')
  async createBlogReview(@Body() body: CreateBookReviewDto) {
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(ReviewableType.Book, bookId, reviewDto);
  }
}
