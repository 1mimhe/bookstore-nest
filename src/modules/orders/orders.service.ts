import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AddBookToCartDto } from './dto/add-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { DataSource, EntityNotFoundError, In, LessThan, Repository } from 'typeorm';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { AuthMessages, NotFoundMessages, UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { Cart } from './orders.types';
import { BooksService } from '../books/books.service';
import { CartResponseDto, UnprocessableDto } from './dto/cart-response.dto';
import { RemoveBookFromCartDto } from './dto/remove-book.dto';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatuses, PaymentStatuses, ShippingTypes } from './entities/order.entity';
import { ShippingPrice } from './entities/shipping-price.entity';
import { InitiateOrderDto as InitiateOrderDto } from './dto/initiate-order.dto';
import { OrderBook } from './entities/order-book.entity';
import { Address } from '../users/entities/address.entity';
import { SubmitOrderDto } from './dto/submit-order.dto';
import { OrderBookDto } from './dto/order-response.dto';
import { Cron } from '@nestjs/schedule';
import { DiscountCodesService } from '../discount-codes/discount-codes.service';

@Injectable()
export class OrdersService {
  private cartCacheTime: number;

  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ShippingPrice) private shippingPriceRepo: Repository<ShippingPrice>,
    private dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private booksService: BooksService,
    config: ConfigService,
    private discountCodesService: DiscountCodesService
  ) {
    this.cartCacheTime = config.get<number>('CART_CACHE_TIME', 2 * 24 * 60 * 60 * 1000);
  }

  async addBookToCart(
    userId: string,
    {
      quantity = 1,
      bookId
    }: AddBookToCartDto
  ) {
    // Get cart from redis
    const cart = await this.getCacheCart(userId);
    const cartBook = cart.books.find(b => b.id === bookId) ?? { id: bookId, quantity: 0 };

    if (!cartBook.quantity) {
      cart.books.push(cartBook);
    }
    cartBook.quantity += quantity;

    // Check book's stock
    const { stock } = await this.bookRepo.findOneOrFail({
      where: { id: bookId }
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });

    if (!stock || stock < cartBook.quantity) {
      throw new UnprocessableEntityException(UnprocessableEntityMessages.BookStock);
    }

    // Update cart in redis
    return this.setCacheCart(userId, cart);
  }

  async removeBookFromCart(
    userId: string,
    {
      amount = 1,
      bookId
    }: RemoveBookFromCartDto
  ) {
    const cart = await this.getCacheCart(userId);
    const cartBook = cart.books.find(b => b.id === bookId);

    if (!cartBook || cartBook.quantity < amount) {
      return false;
    }
    
    cartBook.quantity -= amount;

    if (cartBook.quantity === 0) {
      const cartBookIndex = cart.books.findIndex(b => b.id === bookId);
      cart.books.splice(cartBookIndex, 1);
    }

    await this.setCacheCart(userId, cart);
    return true;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.getCacheCart(userId);

    const bookIds = cart.books.map(b => b.id);
    const books = await this.booksService.getMultipleById(bookIds);

    const unprocessables: UnprocessableDto[] = [];
    const cartBooks: OrderBookDto[] = [];
    const result = books.reduce((acc, book) => {
      const cartBook = cart.books.find(b => b.id === book.id);

      if (!cartBook) return acc;

      // Push unprocessables if book is out of stock
      if (book.stock < cartBook.quantity) {
        unprocessables.push({
          bookName: book.name,
          publisherName: book.publisher.publisherName,
          message: UnprocessableEntityMessages.BookStock
        });
      }

      // If stock is available, reduce quantity to available stock
      if (book.stock) {
        cartBook.quantity = Math.min(cartBook.quantity, book.stock);
      } else {
        return acc;
      }

      // Calculate prices and Push book to cartBooks
      const cartBookFinalPrice = book.finalPrice * cartBook.quantity;
      cartBooks.push({
        ...book,
        imageUrl: book.images[0].url,
        quantity: cartBook.quantity,
        finalPrice: cartBookFinalPrice,
        slug: book.title.slug,
        publisherName: book.publisher.publisherName,
      });

      // Update accumulator
      const newTotalPrice = acc.totalPrice + (book.price * cartBook.quantity);
      const newFinalPrice = acc.finalPrice + cartBookFinalPrice;
      const newDiscount = newTotalPrice - newFinalPrice;
      return {
        totalPrice: newTotalPrice,
        discount: newDiscount,
        finalPrice: newFinalPrice
      };
    }, {
      totalPrice: 0,
      discount: 0,
      finalPrice: 0
    });

    // Update cart in redis
    await this.setCacheCart(userId, cart);

    return {
      unprocessables,
      books: cartBooks,
      ...result
    };
  }

  async clearCart(userId: string) {
    return this.cacheManager.del(`cart-${userId}`);
  }

  async initiateOrder(
    userId: string,
    {
      shippingAddressId,
      shippingType,
      discountCode
    }: InitiateOrderDto
  ) {
    let {
      books,
      totalPrice,
      discount,
      finalPrice
    } = await this.getCart(userId);

    // Sub shipping price
    let shippingPrice = 0;
    if (totalPrice < 10_000_000) {
      shippingPrice = await this.getShippingPrice(shippingType) ?? 0;
    }
    finalPrice += shippingPrice;

    // Apply discount code
    let totalDiscount = discount;
    if (discountCode) {
      const discountResult = await this.discountCodesService.check(
        {
          code: discountCode,
          finalPrice
        },
        userId
      );

      if (!discountResult.isValid) {
        throw new BadRequestException(discountResult.message);
      }

      totalDiscount += discountResult.discountAmount;
      finalPrice -= discountResult.discountAmount;
    }

    return this.dataSource.transaction(async manager => {
      const shippingAddress = await manager.findOneOrFail(Address, {
        where: {
          id: shippingAddressId,
          userId
        }
      }).catch((error: Error) => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(NotFoundMessages.Address);
        }
        throw error;
      });

      const order = manager.create(Order, {
        userId,
        orderBooks: books.map(({ id, ...book }) =>
          manager.create(OrderBook, { bookId: id, ...book })),
        shippingAddressId,
        shippingAddress,
        shippingType,
        totalPrice,
        shippingPrice,
        discountCode,
        discountAmount: totalDiscount,
        finalPrice
      });
      
      return manager.save(Order, order);
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });
    // TODO: It should also return payment info
  }

  async submitOrder(
    userId: string,
    {
      orderId,
      paymentId,
      status
    }: SubmitOrderDto
  ) {
    const order = await this.orderRepo.findOneOrFail({
      where: { id: orderId },
      relations: {
        orderBooks: true
      }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Order);
      }
      throw error;
    });

    if (order.userId !== userId) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    if (order.orderStatus !== OrderStatuses.Pending) {
      throw new BadRequestException('Order has already been processed.');
    }

    // TODO: Check payment status (Simplified)
    if (status === PaymentStatuses.Paid) {
      // TODO: Verify payment
      // if (!paymentVerified) {
        // throw new BadRequestException('Payment verification failed');
      // }

      order.paymentId = paymentId;
      return this.processOrder(order);
    } else if (status === PaymentStatuses.Unpaid) {
      order.paymentStatus = PaymentStatuses.Unpaid;
      order.orderStatus = OrderStatuses.Canceled;
      return this.orderRepo.save(order);
    }

    return order;
  }

  async getAllOrders(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<Order[]> {
    const skip = (page - 1) * limit;
    return this.orderRepo.find({
      where: { userId },
      select: {
        id: true,
        shippingAddress: true,
        paymentStatus: true,
        orderStatus: true,
        shippingType: true,
        shippingPrice: true,
        totalPrice: true,
        discountAmount: true,
        finalPrice: true,
        paymentId: true,
        trackingCode: true,
        createdAt: true,
        updatedAt: true,
      },
      relations: {
        shippingAddress: true,
        orderBooks: {
          book: {
            title: true,
            publisher: true,
            images: true,
          }
        }
      },
      skip,
      take: limit
    });
  }

  // Cron job for cleaning unpaid orders
  @Cron('*/10 * * * *')
  async handlePendingOrderCleanup(): Promise<void> {
    console.log('Starting pending order cleanup job...');

    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    // Find pending orders created more than 15 minutes ago
    const expiredOrders = await this.orderRepo.find({
      where: {
        paymentStatus: PaymentStatuses.Pending,
        createdAt: LessThan(fifteenMinutesAgo),
      },
    });

    if (expiredOrders.length === 0) {
      console.log('No expired pending orders found.');
      return;
    }

    console.log(`Found ${expiredOrders.length} expired pending orders.`);

    // Update orders to unpaid status
    const orderIds = expiredOrders.map(order => order.id);
    const updateResult = await this.orderRepo.update(
      { id: In(orderIds) },
      { 
        paymentStatus: PaymentStatuses.Unpaid,
        orderStatus: OrderStatuses.Canceled
      },
    );

    console.log(
      `Successfully updated ${updateResult.affected} orders to \`unpaid\` status.`,
    );
  }


  private async processOrder(order: Order): Promise<Order> {
    const updatedOrder = await this.dataSource.transaction(async manager => {
      // Update stock and sold column of each order's books
      const updateStockAndSoldPromises = order.orderBooks.flatMap(ob => 
        [
          manager.decrement(
            Book,
            { id: ob.bookId },
            'stock',
            ob.quantity
          ),
          manager.increment(
            Book,
            { id: ob.bookId },
            'sold',
            ob.quantity
          )
        ]
      );
      await Promise.all(updateStockAndSoldPromises);

      // Update order status
      order.paymentStatus = PaymentStatuses.Paid;
      order.orderStatus = OrderStatuses.Processing;
      return manager.save(Order, order);
    });

    // Clear user's cart
    await this.clearCart(order.userId);

    return updatedOrder;
  }

  private async getCacheCart(userId: string) {
    const userBasketKey = `cart-${userId}`;
    const cart = await this.cacheManager.get<Cart>(userBasketKey);

    if (!cart) {
      return this.setCacheCart(userId, {
        books: []
      });
    }
    
    return cart;
  }

  private async setCacheCart(userId: string, cart: Cart) {
    return this.cacheManager.set(`cart-${userId}`, cart, this.cartCacheTime);
  }

  private async getShippingPrice(type: ShippingTypes) {
    return (await this.shippingPriceRepo.findOne({
      where: { type }
    }))?.price;
  }
}
