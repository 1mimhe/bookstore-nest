import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateBookReviewDto } from './dtos/create-review.dto';
import { ReviewableType } from './entities/review.entity';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import {
  GetBlogReviewsResponseDto,
  GetBookReviewsResponseDto,
  ReviewResponseDto,
} from './dtos/review-response.dto';
import { Serialize } from 'src/common/interceptors/serialize.interceptor';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReactToReviewDto } from './dtos/react-review.dto';

@Controller('reviews')
@UseInterceptors(ClassSerializerInterceptor) // Add this
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Create a review for a book',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('books')
  async createBookReview(
    @Body() body: CreateBookReviewDto,
    @Req() req: Request,
  ) {
    const { id } = req.user ?? {};
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(
      id!,
      ReviewableType.Book,
      bookId,
      reviewDto,
    );
  }

  @ApiOperation({
    summary: 'Create a review for a blog',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('blogs')
  async createBlogReview(
    @Body() body: CreateBookReviewDto,
    @Req() req: Request,
  ) {
    const { id } = req.user ?? {};
    const { bookId, ...reviewDto } = body;
    return this.reviewsService.create(
      id!,
      ReviewableType.Book,
      bookId,
      reviewDto,
    );
  }

  @ApiOperation({
    summary: 'Get all reviews of a book',
  })
  @ApiOkResponse({
    type: GetBookReviewsResponseDto,
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(GetBookReviewsResponseDto)
  @Get('books/:id')
  async getBookReviews(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.getAll(
      ReviewableType.Book,
      id,
      page,
      limit,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Get all reviews of a blog',
  })
  @ApiOkResponse({
    type: GetBlogReviewsResponseDto,
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(GetBlogReviewsResponseDto)
  @Get('blogs/:id')
  async getBlogReviews(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.getAll(
      ReviewableType.Blog,
      id,
      page,
      limit,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Get all review\'s replies by its id',
  })
  @ApiOkResponse({
    type: [ReviewResponseDto],
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(ReviewResponseDto)
  @Get('replies/:id')
  async getAllReviewReplies(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.getAllReplies(
      id,
      page,
      limit,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Update a review by its id',
  })
  @ApiOkResponse({
    type: [ReviewResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(ReviewResponseDto)
  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.update(id, userId!, body);
  }

  @ApiOperation({
    summary: 'Delete a review by its id',
  })
  @ApiOkResponse({
    type: [ReviewResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(ReviewResponseDto)
  @Delete(':id')
  async deleteReview(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.delete(id, userId!);
  }

  @ApiOperation({
    summary: 'React to a review',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('reactions')
  async reactToReview(
    @Body() body: ReactToReviewDto,
    @Req() req: Request,
  ) {
    const { id: userId } = req.user ?? {};
    return this.reviewsService.reactToReview(userId!, body);
  }
}
