import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review, ReviewableType } from './entities/review.entity';
import { DataSource, DeepPartial, EntityManager, EntityNotFoundError, In, Repository } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { ReactionsEnum, ReviewReaction } from './entities/review-reaction.entity';
import { NotFoundError } from 'rxjs';
import { AuthMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReactToReviewDto } from './dtos/react-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReaction) private reviewReactionRepo: Repository<ReviewReaction>,
    private dataSource: DataSource
  ) {}

  async create(
    userId: string,
    reviewableType: ReviewableType,
    reviewableId: string,
    {
      parentReviewId,
      ...reviewDto
    }: CreateReviewDto
  ): Promise<Review | never> {
    const entityLike = {
      userId,
      reviewableType,
      parentReviewId,
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

    return this.dataSource.transaction(async manager => {
      const review = manager.create(Review, entityLike);

      if (parentReviewId) {
        await this.incrementRepliesCount(parentReviewId, 1, manager);
      }

      return manager.save(Review, review).catch(error => {
        dbErrorHandler(error);
        throw error;
      });
    });
  }

  async getAll(
    reviewableType: ReviewableType,
    reviewableId: string,
    page = 1,
    limit = 10,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;
    const whereCondition = reviewableType === ReviewableType.Book 
      ? { bookId: reviewableId } 
      : { blogId: reviewableId };

    const queryBuilder = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .where(whereCondition)
      .andWhere('review.parentReviewId IS NULL')
      .orderBy('review.createdAt', 'DESC') // TODO: Add more sorting
      .skip(skip)
      .take(limit);

    const [reviews, totalReviews] = await queryBuilder.getManyAndCount();

    // Add user's reaction status if authenticated
    if (userId) {
      await this.addUserReaction(reviews, userId);
      for (const review of reviews) {
        await this.addUserReaction(review.replies, userId);
      }
    }

    return {
      reviews,
      totalReviews,
      totalReviewPages: Math.ceil(totalReviews / limit)
    };
  }

  async getAllReplies(
    parentReviewId: string,
    page = 1,
    limit = 10,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    const replies = await this.reviewRepo.find({
      where: { parentReviewId },
      relations: {
        replies: true
      },
      order: { createdAt: 'ASC' },
      skip,
      take: limit
    });

    // Add user's reaction status if authenticated
    if (userId) {
      await this.addUserReaction(replies, userId);
    }

    return replies;
  }

  private async getById(
    id: string,
    manager?: EntityManager
  ) {
    const repository = manager ? manager.getRepository(Review) : this.reviewRepo;
    return repository.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Review);
      }
      throw error;
    });
  }

  async update(
    id: string,
    userId: string,
    reviewDto: UpdateReviewDto
  ): Promise<Review | never> {
    const review = await this.getById(id);

    if (review.userId !== userId) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    if (review.isEdited) {
      throw new BadRequestException('Review is already edited before.');
    }

    Object.assign(review, reviewDto);
    review.isEdited = true;
    return this.reviewRepo.save(review);
  }

  async delete(id: string, userId: string) {
    return this.dataSource.transaction(async manager => {
      const review = await this.getById(id, manager);
  
      if (review.userId !== userId) {
        throw new ForbiddenException(AuthMessages.AccessDenied);
      }
  
      await this.incrementRepliesCount(review.parentReviewId, -1, manager);

      return manager.softRemove(Review, review);
    });
  }

  private async addUserReaction(reviews: Review[], userId: string): Promise<void> {
    if (!reviews.length) return;

    const reviewIds = reviews.map(r => r.id);
    const reactions = await this.reviewReactionRepo.find({
      where: { 
        review: { id: In(reviewIds) }, 
        user: { id: userId } 
      }
    });

    reviews.forEach(review => {
      review.userReaction = reactions.find(r => r.reviewId === review.id)?.reaction;
    });
  }

  private incrementRepliesCount(
    parentId?: string,
    increment = 1,
    manager?: EntityManager
  ) {
    if (!parentId) return;
    const repository = manager ? manager.getRepository(Review) : this.reviewRepo;
    return repository.increment({ id: parentId }, 'repliesCount', increment);
  }

  async reactToReview(
    userId: string,
    {
      reviewId,
      reaction
    }: ReactToReviewDto
  ) {
    return this.dataSource.transaction(async manager => {
      const reviewReaction = manager.create(ReviewReaction, {
        userId,
        reviewId,
        reaction,
      });

      await this.incrementReactionsCount(reviewId, reaction, 1, manager);

      return manager.save(ReviewReaction, reviewReaction).catch(error => {
        dbErrorHandler(error);
        throw error;
      });
    });
  }

  private async getReaction(
    reviewId: string,
    userId: string,
    manager?: EntityManager
  ) {
    const repository = manager ? manager.getRepository(ReviewReaction) : this.reviewReactionRepo;
    return repository.findOne({
      where: { reviewId, userId }
    });
  }

  async changeReaction(
    userId: string,
    reviewId: string,
    reaction: ReactionsEnum
  ) {
    return this.dataSource.transaction(async manager => {
      const reviewReaction = await this.getReaction(reviewId, userId, manager);

      if (!reviewReaction) {
        throw new ForbiddenException(AuthMessages.AccessDenied);
      }

      if (reviewReaction.reaction === reaction) {
        throw new BadRequestException(`Your reaction already is "${reaction}".`);
      }

      reviewReaction.reaction = reaction;

      await this.incrementReactionsCount(reviewId, reviewReaction.reaction, -1, manager);
      await this.incrementReactionsCount(reviewId, reaction, 1, manager);

      return manager.save(ReviewReaction, reviewReaction);
    });
  }

  async deleteReaction(
    reviewId: string,
    userId: string
  ) {
    return this.dataSource.transaction(async manager => {
      const reaction = await this.getReaction(reviewId, userId, manager);

      if (!reaction) {
        throw new ForbiddenException(AuthMessages.AccessDenied);
      }

      await this.incrementReactionsCount(reviewId, reaction.reaction, -1, manager);

      return manager.delete(ReviewReaction, reaction);
    });
  }

  private incrementReactionsCount(
    reviewId: string,
    reaction: ReactionsEnum,
    increment = 1,
    manager?: EntityManager
  ) {
    const countColumn = `${reaction}Count`;
    const repository = manager ? manager.getRepository(Review) : this.reviewRepo;
    return repository.increment({ id: reviewId }, countColumn, increment);
  }
}
