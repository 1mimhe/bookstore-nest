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
import { UnprocessableEntityException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let bookRepo: ReturnType<typeof createMockRepository>;
  let orderRepo: ReturnType<typeof createMockRepository>;
  let shippingPriceRepo: ReturnType<typeof createMockRepository>;
  let cacheManager: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    bookRepo = createMockRepository();
    orderRepo = createMockRepository();
    shippingPriceRepo = createMockRepository();
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
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
});
