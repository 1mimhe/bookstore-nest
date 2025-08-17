import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AddBookToCartDto } from './dto/add-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { Cart } from './orders.types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async addBookToCart(
    userId: string,
    {
      quantity = 1,
      bookId
    }: AddBookToCartDto
  ) {
    // Get cart from redis
    const cart = await this.getBasket(userId);
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
    return this.setBasket(userId, cart);
  }

  private async getBasket(userId: string) {
    const userBasketKey = `cart-${userId}`;
    const cart = await this.cacheManager.get<Cart>(userBasketKey);

    if (!cart) {
      return this.setBasket(userId, {
        books: []
      });
    }
    
    return cart;
  }

  private async setBasket(userId: string, cart: Cart) {
    return this.cacheManager.set(`cart-${userId}`, cart);
  }
}
