import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AddBookToBasketDto } from './dto/add-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { UnprocessableEntityMessages } from 'src/common/enums/error.messages';
import { Basket } from './orders.types';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async addBookToBasket(
    userId: string,
    {
      amount = 1,
      bookId
    }: AddBookToBasketDto
  ) {
    // Get basket from redis
    const basket = await this.getBasket(userId);
    const basketBook = basket.books.find(b => b.id === bookId) ?? { id: bookId, amount: 0 };

    if (!basketBook.amount) {
      basket.books.push(basketBook);
    }
    basketBook.amount += amount;

    // Check book's stock
    const { stock } = await this.bookRepo.findOneOrFail({
      where: { id: bookId }
    }).catch(error => {
      dbErrorHandler(error);
      throw error;
    });

    if (!stock || stock < basketBook.amount) {
      throw new UnprocessableEntityException(UnprocessableEntityMessages.BookStock);
    }

    // Update basket in redis
    return this.setBasket(userId, basket);
  }

  private async getBasket(userId: string) {
    const userBasketKey = `basket-${userId}`;
    const basket = await this.cacheManager.get<Basket>(userBasketKey);

    if (!basket) {
      return this.setBasket(userId, {
        books: []
      });
    }
    
    return basket;
  }

  private async setBasket(userId: string, basket: Basket) {
    return this.cacheManager.set(`basket-${userId}`, basket);
  }
}
