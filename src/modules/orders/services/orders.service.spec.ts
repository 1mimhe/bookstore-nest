import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Book } from '../../books/entities/book.entity';
import { Order, OrderStatuses, PaymentStatuses } from '../entities/order.entity';
import { ShippingPrice } from '../entities/shipping-price.entity';
import { DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BooksService } from '../../books/books.service';
import { ConfigService } from '@nestjs/config';
import { DiscountCodesService } from '../../discount-codes/discount-codes.service';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import {
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PAYMENT_GATEWAY } from '../../payments/payment.gateway';

describe('OrdersService', () => {
  let service: OrdersService;
  let bookRepo: ReturnType<typeof createMockRepository>;
  let orderRepo: ReturnType<typeof createMockRepository>;
  let shippingPriceRepo: ReturnType<typeof createMockRepository>;
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };
  let paymentGateway: {
    initiatePayment: jest.Mock;
    verifyPayment: jest.Mock;
  };

  beforeEach(async () => {
    bookRepo = createMockRepository();
    orderRepo = createMockRepository();
    shippingPriceRepo = createMockRepository();
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };
    paymentGateway = {
      initiatePayment: jest.fn().mockResolvedValue({
        paymentId: 'MOCK-12345678-250000',
        paymentUrl: '/payments/mock/checkout?paymentId=MOCK-12345678-250000',
      }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Book), useValue: bookRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(ShippingPrice), useValue: shippingPriceRepo },
        { provide: DataSource, useValue: createMockDataSource() },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        {
          provide: BooksService,
          useValue: { getMultipleById: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(172800000) },
        },
        {
          provide: DiscountCodesService,
          useValue: { check: jest.fn().mockResolvedValue({ isValid: true, discountAmount: 0 }) },
        },
        {
          provide: PAYMENT_GATEWAY,
          useValue: paymentGateway,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addBookToCart', () => {
    it('should add a book to the cart when sufficient stock is available', async () => {
      cacheManager.get.mockResolvedValue({ books: [] });
      bookRepo.findOneOrFail.mockResolvedValue({ id: 'book-1', stock: 5 });

      await service.addBookToCart('user-1', { bookId: 'book-1', quantity: 2 });

      expect(cacheManager.set).toHaveBeenCalledWith(
        'cart:user-1',
        { books: [{ id: 'book-1', quantity: 2 }] },
        expect.any(Number),
      );
    });

    it('should throw UnprocessableEntityException when book stock is insufficient', async () => {
      cacheManager.get.mockResolvedValue({ books: [] });
      bookRepo.findOneOrFail.mockResolvedValue({ id: 'book-1', stock: 1 });

      await expect(
        service.addBookToCart('user-1', { bookId: 'book-1', quantity: 5 }),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('handlePendingOrderCleanup', () => {
    it('should find expired pending orders and cancel them', async () => {
      const mockExpiredOrders = [
        { id: 'order-1', paymentStatus: PaymentStatuses.Pending },
        { id: 'order-2', paymentStatus: PaymentStatuses.Pending },
      ];
      orderRepo.find.mockResolvedValue(mockExpiredOrders);
      orderRepo.update.mockResolvedValue({ affected: 2 });

      await service.handlePendingOrderCleanup();

      expect(orderRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          paymentStatus: PaymentStatuses.Unpaid,
          orderStatus: OrderStatuses.Canceled,
        }),
      );
    });

    it('should do nothing if no expired pending orders exist', async () => {
      orderRepo.find.mockResolvedValue([]);

      await service.handlePendingOrderCleanup();

      expect(orderRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('submitOrder', () => {
    const orderId = 'order-1';
    const userId = 'user-1';

    const setupPendingOrder = () => {
      orderRepo.findOneOrFail.mockResolvedValue({
        id: orderId,
        userId,
        finalPrice: 250000,
        orderStatus: OrderStatuses.Pending,
        paymentStatus: PaymentStatuses.Pending,
        orderBooks: [],
      });
    };

    it('should finalize the order when the gateway verifies the payment', async () => {
      setupPendingOrder();
      paymentGateway.verifyPayment.mockResolvedValue({
        verified: true,
        amount: 250000,
      });
      const processSpy = jest
        .spyOn(service as any, 'processOrder')
        .mockResolvedValue({ id: orderId, orderStatus: OrderStatuses.Processing });

      await service.submitOrder(userId, { orderId, paymentId: 'MOCK-12345678-250000' });

      expect(paymentGateway.verifyPayment).toHaveBeenCalledWith(
        'MOCK-12345678-250000',
        250000,
      );
      expect(processSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: orderId, paymentId: 'MOCK-12345678-250000' }),
      );
    });

    it('should cancel the order and throw when verification fails (no client-supplied status)', async () => {
      setupPendingOrder();
      paymentGateway.verifyPayment.mockResolvedValue({
        verified: false,
        reason: 'Payment was rejected by the gateway.',
      });

      await expect(
        service.submitOrder(userId, { orderId, paymentId: 'fail-MOCK-12345678-250000' }),
      ).rejects.toThrow(BadRequestException);

      expect(orderRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          orderStatus: OrderStatuses.Canceled,
          paymentStatus: PaymentStatuses.Unpaid,
        }),
      );
    });

    it('should cancel the order when the payment amount does not match the order total', async () => {
      setupPendingOrder();
      paymentGateway.verifyPayment.mockResolvedValue({
        verified: false,
        reason: 'Payment amount does not match the order total.',
      });

      await expect(
        service.submitOrder(userId, { orderId, paymentId: 'MOCK-12345678-100' }),
      ).rejects.toThrow('Payment amount does not match');
    });

    it('should never trust a client-provided payment status', async () => {
      setupPendingOrder();
      paymentGateway.verifyPayment.mockResolvedValue({ verified: true });

      await service.submitOrder(userId, {
        orderId,
        paymentId: 'MOCK-12345678-250000',
        status: 'paid',
      } as any);

      // Verification must run even when the client claims "paid"
      expect(paymentGateway.verifyPayment).toHaveBeenCalled();
    });

    it('should reject submissions for orders that are not pending (idempotency guard)', async () => {
      orderRepo.findOneOrFail.mockResolvedValue({
        id: orderId,
        userId,
        orderStatus: OrderStatuses.Processing,
        orderBooks: [],
      });

      await expect(
        service.submitOrder(userId, { orderId, paymentId: 'MOCK-12345678-250000' }),
      ).rejects.toThrow('Order has already been processed.');

      expect(paymentGateway.verifyPayment).not.toHaveBeenCalled();
    });
  });
});
