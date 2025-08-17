import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Order } from './order.entity';
import { Book } from 'src/modules/books/entities/book.entity';

@Entity('order_books')
@Index(['orderId'])
@Unique('ORDER_BOOK_UNIQUE', ['order', 'book'])
export class OrderBook extends BaseEntity {
  @Column('uuid')
  orderId: string;
  @ManyToOne(() => Order, (order) => order.orderBooks)
  @JoinColumn()
  order: Order;

  @Column('uuid')
  bookId: string;
  @ManyToOne(() => Book, (book) => book.orderBooks, { eager: true })
  @JoinColumn()
  book: Book;

  @Column('int', { default: 1 })
  quantity: number;

  @Column('int')
  price: number;

  get totalPrice() {
    return this.quantity * this.book.price * (1 - (this.book.discountPercent ?? 0));
  }
}