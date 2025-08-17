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
import { BooksService } from '../books/books.service';
import { CartBookDto, CartResponseDto, UnprocessableDto } from './dto/cart-response.dto';
import { RemoveBookFromCartDto } from './dto/remove-book.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private booksService: BooksService
  ) {}

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
    const cartBooks: CartBookDto[] = [];
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
    return this.cacheManager.set(`cart-${userId}`, cart);
  }
}
