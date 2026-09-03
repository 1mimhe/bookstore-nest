import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { CollectionsController } from '../src/modules/collections/controllers/collections.controller';
import { CollectionsService } from '../src/modules/collections/services/collections.service';
import { ViewsService } from '../src/modules/views/views.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { SoftAuthGuard } from '../src/modules/auth/guards/soft-auth.guard';

describe('CollectionsController (e2e)', () => {
  let app: INestApplication;

  const mockCollection = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Best of Sci-Fi',
    slug: 'best-of-sci-fi',
    description: 'Curated list of science fiction novels',
    isPublic: true,
    views: 42,
    bookCount: 5,
    createdAt: new Date().toISOString(),
    user: {
      username: 'curator',
      firstName: 'Alan',
      lastName: 'Turing',
      role: 'admin',
    },
    collectionBooks: [],
  };

  const mockCollectionsService = {
    create: jest.fn().mockResolvedValue(mockCollection),
    getAll: jest.fn().mockResolvedValue([mockCollection]),
    getUserCollections: jest.fn().mockResolvedValue([mockCollection]),
    get: jest.fn().mockResolvedValue(mockCollection),
    getCollectionsByTitleId: jest.fn().mockResolvedValue([mockCollection]),
    createCollectionBook: jest.fn().mockResolvedValue({ id: 'cb-1', order: 1 }),
    update: jest.fn().mockResolvedValue(mockCollection),
    delete: jest.fn().mockResolvedValue(mockCollection),
  };

  const mockViewsService = {
    recordView: jest.fn().mockResolvedValue({ counted: true }),
    getTrendingEntities: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        { provide: CollectionsService, useValue: mockCollectionsService },
        { provide: ViewsService, useValue: mockViewsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(SoftAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 'user-uuid-1', username: 'curator' };
      req.session = { userId: 'user-uuid-1', staffId: 'staff-1' };
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

  describe('POST /collections', () => {
    it('should create new collection', async () => {
      const res = await request(app.getHttpServer())
        .post('/collections')
        .send({
          name: 'Best of Sci-Fi',
          slug: 'best-of-sci-fi',
          description: 'Curated list of science fiction novels',
          isPublic: true,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('slug', 'best-of-sci-fi');
    });
  });

  describe('GET /collections', () => {
    it('should list public collections', async () => {
      const res = await request(app.getHttpServer())
        .get('/collections')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /collections/slug/:slug', () => {
    it('should retrieve collection by slug and record view', async () => {
      const res = await request(app.getHttpServer())
        .get('/collections/slug/best-of-sci-fi')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Best of Sci-Fi');
      expect(mockViewsService.recordView).toHaveBeenCalled();
    });
  });

  describe('DELETE /collections/:id', () => {
    it('should delete collection', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/collections/${mockCollection.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
