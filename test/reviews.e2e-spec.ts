import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { ReviewsController } from '../src/modules/reviews/controllers/reviews.controller';
import { ReviewsService } from '../src/modules/reviews/services/reviews.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { SoftAuthGuard } from '../src/modules/auth/guards/soft-auth.guard';
import { ReviewableType } from '../src/modules/reviews/entities/review.entity';
import { ReactionsEnum } from '../src/modules/reviews/entities/review-reaction.entity';

describe('ReviewsController (e2e)', () => {
  let app: INestApplication;

  const mockReview = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    content: 'An absolute masterpiece of literature.',
    rate: 5,
    likeCount: 12,
    dislikeCount: 0,
    loveCount: 5,
    fireCount: 3,
    tomatoCount: 0,
    isEdited: false,
    createdAt: new Date().toISOString(),
    user: {
      username: 'critic',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'customer',
    },
    replies: [],
  };

  const mockReviewsService = {
    create: jest.fn().mockResolvedValue(mockReview),
    getAll: jest.fn().mockResolvedValue({
      reviews: [mockReview],
      totalReviews: 1,
      totalReviewPages: 1,
    }),
    getAllReplies: jest.fn().mockResolvedValue([]),
    getMyReviews: jest.fn().mockResolvedValue({
      reviews: [mockReview],
      count: 1,
    }),
    update: jest.fn().mockResolvedValue({
      ...mockReview,
      content: 'Updated review content.',
      isEdited: true,
    }),
    delete: jest.fn().mockResolvedValue(mockReview),
    reactToReview: jest.fn().mockResolvedValue({
      userId: 'user-uuid-1',
      reviewId: mockReview.id,
      reaction: ReactionsEnum.Like,
    }),
    changeReaction: jest.fn().mockResolvedValue({
      userId: 'user-uuid-1',
      reviewId: mockReview.id,
      reaction: ReactionsEnum.Love,
    }),
    deleteReaction: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        { provide: ReviewsService, useValue: mockReviewsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SoftAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 'user-uuid-1', username: 'critic' };
      req.session = { userId: 'user-uuid-1' };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /reviews/:reviewableType', () => {
    it('should create review for book', async () => {
      const res = await request(app.getHttpServer())
        .post(`/reviews/${ReviewableType.Book}`)
        .send({
          reviewableType: ReviewableType.Book,
          reviewableId: '123e4567-e89b-12d3-a456-426614174000',
          rate: 5,
          content: 'An absolute masterpiece of literature.',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('content');
    });
  });

  describe('GET /reviews/:reviewableType/:reviewableId', () => {
    it('should list reviews with pagination metadata', async () => {
      const res = await request(app.getHttpServer())
        .get(`/reviews/${ReviewableType.Book}/123e4567-e89b-12d3-a456-426614174000`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reviews');
      expect(res.body.data.reviews).toHaveLength(1);
    });
  });

  describe('POST /reviews/reactions', () => {
    it('should react to review', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews/reactions')
        .send({
          reviewId: mockReview.id,
          reaction: ReactionsEnum.Like,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('reaction', ReactionsEnum.Like);
    });
  });

  describe('DELETE /reviews/:id', () => {
    it('should soft delete review', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/reviews/${mockReview.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
