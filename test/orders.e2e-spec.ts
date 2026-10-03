import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { OrdersController } from '../src/modules/orders/controllers/orders.controller';
import { OrdersService } from '../src/modules/orders/services/orders.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { ShippingTypes } from '../src/modules/orders/entities/order.entity';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  const mockCart = {
    totalPrice: 100,
    books: [{ id: validUuid, name: 'Clean Code', quantity: 2, price: 50 }],
  };

  const mockOrdersService = {
    addBookToCart: jest.fn().mockResolvedValue(mockCart),
    getCart: jest.fn().mockResolvedValue(mockCart),
    removeBookFromCart: jest.fn().mockResolvedValue(true),
    initiateOrder: jest.fn().mockResolvedValue({
      id: validUuid,
      orderNumber: 'ORD-2026-001',
      totalPrice: 100,
      discountAmount: 10,
      finalPrice: 90,
      shippingPrice: 15,
      payablePrice: 105,
    }),
    submitOrder: jest.fn().mockResolvedValue({
      id: validUuid,
      paymentStatus: 'paid',
      orderStatus: 'processing',
    }),
    getAllOrders: jest.fn().mockResolvedValue([
      { id: validUuid, orderNumber: 'ORD-2026-001', finalPrice: 90, payablePrice: 105 },
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: validUuid, username: 'buyer' };
      req.session = { userId: validUuid };
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

  describe('POST /orders/cart/add-book', () => {
    it('should add book to cart and return enveloped cart', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders/cart/add-book')
        .send({ bookId: validUuid, quantity: 2 })
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('totalPrice', 100);
      expect(res.body.data.books).toHaveLength(1);
    });
  });

  describe('GET /orders/cart', () => {
    it('should retrieve current user cart', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/cart')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalPrice', 100);
    });
  });

  describe('PATCH /orders/cart/remove-book', () => {
    it('should remove item from cart', async () => {
      const res = await request(app.getHttpServer())
        .patch('/orders/cart/remove-book')
        .send({ bookId: validUuid, amount: 1 })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBe(true);
    });
  });

  describe('POST /orders', () => {
    it('should calculate totals and return initial order review', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .send({
          shippingAddressId: validUuid,
          shippingType: ShippingTypes.Post,
          discountCode: 'SAVE10',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('orderNumber', 'ORD-2026-001');
      expect(res.body.data).toHaveProperty('payablePrice', 105);
    });
  });

  describe('POST /orders/submit', () => {
    it('should verify payment server-side and finalize the order', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders/submit')
        .send({
          orderId: validUuid,
          paymentId: 'MOCK-123E4567-105',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('paymentStatus', 'paid');

      // The legacy client-supplied `status` field must no longer be accepted
      // as part of the request contract.
      expect(mockOrdersService.submitOrder).toHaveBeenCalledWith(
        validUuid,
        expect.not.objectContaining({ status: expect.anything() }),
      );
    });
  });

  describe('GET /orders', () => {
    it('should fetch user order history', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
