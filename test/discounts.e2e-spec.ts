import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { DiscountCodesController } from '../src/modules/discount-codes/controllers/discount-codes.controller';
import { DiscountCodesService } from '../src/modules/discount-codes/services/discount-codes.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { DiscountCodeType } from '../src/modules/discount-codes/entities/discount-code.entity';

describe('DiscountCodesController (e2e)', () => {
  let app: INestApplication;

  const mockDiscountCode = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    code: 'SAVE20',
    type: DiscountCodeType.Percentage,
    value: 20,
    usageLimit: 100,
    usedCount: 5,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
  };

  const mockDiscountCodesService = {
    create: jest.fn().mockResolvedValue(mockDiscountCode),
    getAll: jest.fn().mockResolvedValue([mockDiscountCode]),
    getById: jest.fn().mockResolvedValue(mockDiscountCode),
    check: jest.fn().mockResolvedValue({
      discountAmount: 20,
      finalPrice: 80,
    }),
    update: jest.fn().mockResolvedValue(mockDiscountCode),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DiscountCodesController],
      providers: [
        { provide: DiscountCodesService, useValue: mockDiscountCodesService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 'user-uuid-1', username: 'shopper' };
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

  describe('POST /discount-codes/check', () => {
    it('should validate and calculate discount savings', async () => {
      const res = await request(app.getHttpServer())
        .post('/discount-codes/check')
        .send({
          code: 'SAVE20',
          finalPrice: 100,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('discountAmount', 20);
      expect(res.body.data).toHaveProperty('finalPrice', 80);
    });
  });

  describe('POST /discount-codes', () => {
    it('should create new discount code', async () => {
      const res = await request(app.getHttpServer())
        .post('/discount-codes')
        .send({
          code: 'SAVE20',
          type: DiscountCodeType.Percentage,
          value: 20,
          usageLimit: 100,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('code', 'SAVE20');
    });
  });

  describe('GET /discount-codes', () => {
    it('should list discount codes', async () => {
      const res = await request(app.getHttpServer())
        .get('/discount-codes')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /discount-codes/:id', () => {
    it('should soft delete discount code', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/discount-codes/${mockDiscountCode.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
