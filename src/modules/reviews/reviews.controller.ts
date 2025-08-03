import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateBookReviewDto } from './dtos/create-review.dto';
import { ReviewableType } from './entities/review.entity';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Create a review for a book'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('books')
  async createBookReview(
    @Body() body: CreateBookReviewDto,
    @Req() req: Request
  ) {    
    const { id } = req.user ?? {};
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(id!, ReviewableType.Book, bookId, reviewDto);
  }

  @ApiOperation({
    summary: 'Create a review for a blog'
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('blogs')
  async createBlogReview(
    @Body() body: CreateBookReviewDto,
    @Req() req: Request
  ) {    
    const { id } = req.user ?? {};
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(id!, ReviewableType.Book, bookId, reviewDto);
  }
}
