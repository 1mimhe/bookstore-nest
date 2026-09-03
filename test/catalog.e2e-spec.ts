import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { TitlesController } from '../src/modules/books/titles.controller';
import { BooksController } from '../src/modules/books/books.controller';
import { TitlesService } from '../src/modules/books/titles.service';
import { BooksService } from '../src/modules/books/books.service';
import { ViewsService } from '../src/modules/views/views.service';
import { CookieService } from '../src/common/services/cookie.service';
import { RecentViewsInterceptor } from '../src/common/interceptors/recent-views.interceptor';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('Catalog (e2e)', () => {
  let app: INestApplication;

  const mockTitles = [
    {
      id: 'title-uuid-1',
      titleName: 'Clean Architecture',
      slug: 'clean-architecture',
      authors: [],
    },
    {
      id: 'title-uuid-2',
      titleName: 'Refactoring',
      slug: 'refactoring',
      authors: [],
    },
  ];

  const mockTitlesService = {
    getTrending: jest.fn().mockResolvedValue(mockTitles),
    getBySlug: jest.fn().mockImplementation((slug: string) => {
      const match = mockTitles.find((t) => t.slug === slug);
      if (match) return Promise.resolve(match);
      return Promise.reject(new Error('Title not found'));
    }),
  };

  const mockBooksService = {
    getAll: jest.fn().mockResolvedValue([
      { id: 'book-uuid-1', ISBN: '978-0134494166', price: 39.99, title: mockTitles[0] },
    ]),
  };

  const mockViewsService = {
    recordView: jest.fn().mockResolvedValue(true),
  };

  const mockCookieService = {
    updateRecentViewsCookie: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TitlesController, BooksController],
      providers: [
        { provide: TitlesService, useValue: mockTitlesService },
        { provide: BooksService, useValue: mockBooksService },
        { provide: ViewsService, useValue: mockViewsService },
        { provide: CookieService, useValue: mockCookieService },
        RecentViewsInterceptor,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /titles/trending/week - should return trending titles inside standardized envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/titles/trending/week')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body).toHaveProperty('timestamp');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.data[0].slug).toBe('clean-architecture');
  });

  it('GET /books - should return books list inside standardized envelope', async () => {
    const response = await request(app.getHttpServer())
      .get('/books')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0].ISBN).toBe('978-0134494166');
  });

  it('GET /titles/slug/:slug - should fetch title and intercept recent views cookie', async () => {
    const response = await request(app.getHttpServer())
      .get('/titles/slug/clean-architecture')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.slug).toBe('clean-architecture');
    expect(mockViewsService.recordView).toHaveBeenCalled();
  });
});
