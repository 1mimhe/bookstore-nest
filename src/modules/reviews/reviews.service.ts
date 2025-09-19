import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review, ReviewableType } from './entities/review.entity';
import { DataSource, DeepPartial, EntityManager, EntityNotFoundError, In, Repository, SelectQueryBuilder } from 'typeorm';
import { CreateReviewDto } from './dtos/create-review.dto';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { ReactionsEnum, ReviewReaction } from './entities/review-reaction.entity';
import { AuthMessages, NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateReviewDto } from './dtos/update-review.dto';
import { ReactToReviewDto } from './dtos/react-review.dto';
import { BooksService } from '../books/books.service';
import { RolesEnum } from '../users/entities/role.entity';
import { ReviewQueryDto, ReviewSortBy } from './dtos/review-query.dto';
import { Book } from '../books/entities/book.entity';
import { Author } from '../authors/author.entity';
import { Publisher } from '../publishers/publisher.entity';
import { Blog } from '../blogs/blog.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ReviewReaction) private reviewReactionRepo: Repository<ReviewReaction>,
    private dataSource: DataSource,
    private booksService: BooksService
  ) {}

  async create(
    userId: string,
    {
      reviewableType,
      reviewableId,
      parentReviewId,
      rate,
      content
    }: CreateReviewDto
  ): Promise<Review | never> {
    const MODEL_MAP = {
      [ReviewableType.Book]: Book,
      [ReviewableType.Author]: Author,
      [ReviewableType.Publisher]: Publisher,
      [ReviewableType.Blog]: Blog,
    } as const;
    
    return this.dataSource.transaction(async manager => {
      const reviewableRepo = manager.getRepository(MODEL_MAP[reviewableType]);
      const reviewable = await reviewableRepo.findOne({
        where: { id: reviewableId }
      });

      if (!reviewable) {
        throw new NotFoundException(NotFoundMessages.Reviewable);
      }
      
      const entityLike: DeepPartial<Review> = {
        userId,
        reviewableType,
        reviewableId,
        parentReviewId,
        rate,
        content
      };

      // Update book rating
      if (reviewableType === ReviewableType.Book && rate) {
        await this.booksService.updateRate(reviewableId, rate, 1, manager);
      }
      
      const review = manager.create(Review, entityLike);
      const dbReview = await manager.save(Review, review);
      
      if (parentReviewId) {
        await this.incrementRepliesCount(parentReviewId, 1, manager);
      }

      return dbReview;
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getAll(
    reviewableType: ReviewableType,
    reviewableId: string,
    {
      page = 1,
      limit = 10,
      sortBy = ReviewSortBy.Newest,
    }: ReviewQueryDto,
    userId?: string,
  ) {
    const skip = (page - 1) * limit;

    const qb = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('user.roles', 'userRoles')
      .leftJoinAndSelect('review.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser');

    this.addReviewableConditions(qb, reviewableType, reviewableId);

    // Apply sorting
    this.buildReviewOrderBy(qb, sortBy);

    const [reviews, totalReviews] = await qb
      .andWhere('review.parentReviewId IS NULL')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Add user's reaction status if authenticated
    if (userId) {
      await this.addUserReaction(reviews, userId);
      for (const review of reviews) {
        await this.addUserReaction(review.replies, userId);
      }
    }

    return {
      reviews: reviews.map(r => ({
        ...r,
        user: {
          ...r.user,
          // Add user's role to response => customer/admin
          role: r.user.roles[0].role === RolesEnum.Customer ? RolesEnum.Customer : RolesEnum.Admin,
          roles: undefined
        },
      })),
      totalReviews,
      totalReviewPages: Math.ceil(totalReviews / limit)
    };
  }

  private addReviewableConditions(
    qb: SelectQueryBuilder<Review>,
    reviewableType: ReviewableType,
    reviewableId: string
  ) {
    qb.where('review.reviewableType = :reviewableType', { reviewableType })
      .andWhere('review.reviewableId = :reviewableId', { reviewableId });

    if(reviewableType === ReviewableType.Book) {
      qb.leftJoinAndSelect('review.book', 'book');
    }
  }

  private buildReviewOrderBy(
    qb: SelectQueryBuilder<Review>,
    sortBy: ReviewSortBy = ReviewSortBy.Newest
  ): void {
    switch (sortBy) {
      case ReviewSortBy.MostReactions:
        qb.addSelect(
          'review.likeCount + review.dislikeCount + review.loveCount + review.fireCount + review.tomatoCount',
          'totalReactions'
        )
        .orderBy('totalReactions', 'DESC')
        .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostLiked:
        qb.orderBy('review.likeCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostDisliked:
        qb.orderBy('review.dislikeCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostLoved:
        qb.orderBy('review.loveCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostFire:
        qb.orderBy('review.fireCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostTomato:
        qb.orderBy('review.tomatoCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.MostReplies:
        qb.orderBy('review.repliesCount', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      
      case ReviewSortBy.HighestRate:
        qb.orderBy('review.rate', 'DESC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.LowestRate:
        qb.orderBy('review.rate', 'ASC')
          .addOrderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.Newest:
      default:
        qb.orderBy('review.createdAt', 'DESC');
        break;
    }
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

  async getMyReviews(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ reviews: Review[]; count: number }> {
    const skip = (page - 1) * limit;
    const [reviews, count] = await this.reviewRepo.findAndCount({
      where: { userId },
      order: {
        createdAt: 'DESC'
      },
      skip,
      take: limit
    });

    return {
      reviews,
      count
    };
  }

  async update(
    id: string,
    userId: string,
    reviewDto: UpdateReviewDto
  ): Promise<Review | never> {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const review = await this.getById(id, manager);

      // Check user access
      if (review.userId !== userId) {
        throw new ForbiddenException(AuthMessages.AccessDenied);
      }

      // Check if review was already edited
      if (review.isEdited) {
        throw new BadRequestException('Review has already been edited.');
      }

      if (review.reviewableType === ReviewableType.Book && reviewDto.rate && reviewDto.rate !== review.rate) {
        const rateDiff = reviewDto.rate - (review.rate ?? 0);
        await this.booksService.updateRate(review.reviewableId, rateDiff, 0, manager);
      }

      Object.assign(review, reviewDto);
      review.isEdited = true;

      return manager.save(Review, review);
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async delete(id: string, userId: string) {
    return this.dataSource.transaction(async manager => {
      const review = await this.getById(id, manager);
  
      // Check user access
      if (review.userId !== userId) {
        throw new ForbiddenException(AuthMessages.AccessDenied);
      }
  
      if (review.reviewableType === ReviewableType.Book) {
        await this.booksService.updateRate(review.reviewableId, review.rate, -1, manager);
      }

      if (review.parentReviewId) {
        await this.incrementRepliesCount(review.parentReviewId, -1, manager);
      }

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
