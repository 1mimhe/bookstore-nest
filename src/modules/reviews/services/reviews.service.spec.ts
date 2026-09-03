import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review, ReviewableType } from '../entities/review.entity';
import { ReviewReaction, ReactionsEnum } from '../entities/review-reaction.entity';
import { DataSource } from 'typeorm';
import { BooksService } from '../../books/books.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewRepo: ReturnType<typeof createMockRepository>;
  let reactionRepo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let booksService: Partial<BooksService>;

  beforeEach(async () => {
    reviewRepo = createMockRepository();
    reactionRepo = createMockRepository();
    dataSource = createMockDataSource();
    booksService = {
      updateRate: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: reviewRepo },
        { provide: getRepositoryToken(ReviewReaction), useValue: reactionRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: BooksService, useValue: booksService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create review for a book and update book rating', async () => {
      const mockBook = { id: 'book-1' };
      dataSource.manager.getRepository().findOne.mockResolvedValue(mockBook);
      const savedReview = { id: 'rev-1', userId: 'u1', reviewableId: 'book-1', rate: 5, content: 'Nice' };
      dataSource.manager.create.mockReturnValue(savedReview);
      dataSource.manager.save.mockResolvedValue(savedReview);

      const result = await service.create('u1', {
        reviewableType: ReviewableType.Book,
        reviewableId: 'book-1',
        rate: 5,
        content: 'Nice',
      } as any);

      expect(result).toEqual(savedReview);
      expect(booksService.updateRate).toHaveBeenCalledWith('book-1', 5, 1, dataSource.manager);
    });

    it('should throw NotFoundException if reviewable entity does not exist', async () => {
      dataSource.manager.getRepository().findOne.mockResolvedValue(null);

      await expect(
        service.create('u1', {
          reviewableType: ReviewableType.Book,
          reviewableId: 'non-existing',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw ForbiddenException if review does not belong to user', async () => {
      const existing = { id: 'rev-1', userId: 'owner-id', isEdited: false };
      dataSource.manager.getRepository().findOneOrFail.mockResolvedValue(existing);

      await expect(service.update('rev-1', 'attacker-id', { content: 'Hacked' })).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if review is already edited', async () => {
      const existing = { id: 'rev-1', userId: 'u1', isEdited: true };
      dataSource.manager.getRepository().findOneOrFail.mockResolvedValue(existing);

      await expect(service.update('rev-1', 'u1', { content: 'Edit again' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('reactToReview', () => {
    it('should save reaction and increment reaction count', async () => {
      const mockReaction = { userId: 'u1', reviewId: 'rev-1', reaction: ReactionsEnum.Like };
      dataSource.manager.create.mockReturnValue(mockReaction);
      dataSource.manager.save.mockResolvedValue(mockReaction);
      dataSource.manager.getRepository().increment.mockResolvedValue({} as any);

      const result = await service.reactToReview('u1', {
        reviewId: 'rev-1',
        reaction: ReactionsEnum.Like,
      });

      expect(result).toEqual(mockReaction);
      expect(dataSource.manager.getRepository().increment).toHaveBeenCalledWith(
        { id: 'rev-1' },
        'likeCount',
        1,
      );
    });
  });
});
