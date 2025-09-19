import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewableType } from './entities/review.entity';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import {
  ReviewResponseDto,
  ReviewResponseWithCountDto,
  ReviewsResponseDto,
} from './dtos/review-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReactToReviewDto } from './dtos/react-review.dto';
import { ChangeReactionDto } from './dtos/change-reaction.dto';
import { SoftAuthGuard } from '../auth/guards/soft-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CreateReviewDto } from './dtos/create-review.dto';
import { ReviewQueryDto } from './dtos/review-query.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';

@Controller('reviews')
@ApiTags('Review')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @ApiOperation({
    summary: 'Create a review',
    description: 'You can create review for books, blogs, authors and publishers.'
  })
  @ApiNotFoundResponse({
    description: NotFoundMessages.Reviewable
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':reviewableType')
  async createReview(
    @Body() body: CreateReviewDto,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.create(userId, body);
  }

  @ApiOperation({
    summary: 'Get all reviews',
    description: 'Retrieves books\', blogs\', authors\' and publisher\'s reviews.'
  })
  @ApiOkResponse({
    type: ReviewsResponseDto,
  })
  @ApiParam({
    name: 'reviewableType',
    enum: ReviewableType
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @UseGuards(SoftAuthGuard)
  @Serialize(ReviewsResponseDto)
  @Get(':reviewableType/:reviewableId')
  async getAllReviews(
    @Param('reviewableType', new ParseEnumPipe(ReviewableType))
    reviewableType: ReviewableType,
    @Param('reviewableId', ParseUUIDPipe) reviewableId: string,
    @Query() query: ReviewQueryDto,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.getAll(
      reviewableType,
      reviewableId,
      query,
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
  @UseGuards(SoftAuthGuard)
  @Serialize(ReviewResponseDto)
  @Get('replies/:id')
  async getAllReviewReplies(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.getAllReplies(
      id,
      page,
      limit,
      userId,
    );
  }

  @ApiOperation({
    summary: 'Get all authenticated user\'s reviews',
  })
  @ApiOkResponse({
    type: [ReviewResponseWithCountDto],
  })
  @ApiQueryPagination()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Serialize(ReviewResponseWithCountDto)
  @Get()
  async getMyReviews(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.getMyReviews(userId, page, limit)
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
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.update(id, userId, body);
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
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.delete(id, userId);
  }

  @ApiOperation({
    summary: 'React to a review',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('reactions')
  async reactToReview(
    @Body() body: ReactToReviewDto,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.reactToReview(userId!, body);
  }

  @ApiOperation({
    summary: 'Change a reaction by review id',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('reactions/:id')
  async changeReaction(
    @Param('id') id: string,
    @Body() body: ChangeReactionDto,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.changeReaction(userId, id, body.reaction);
  }

  @ApiOperation({
    summary: 'Delete a reaction by review id',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('reactions/:id')
  async deleteReaction(
    @Param('id') id: string,
    @CurrentUser('id') userId: string
  ) {
    return this.reviewsService.deleteReaction(id, userId);
  }
}
