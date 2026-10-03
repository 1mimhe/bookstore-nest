import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from '../books/entities/book.entity';
import { TokenModule } from '../token/token.module';
import { BooksModule } from '../books/books.module';
import { Order } from './entities/order.entity';
import { ShippingPrice } from './entities/shipping-price.entity';
import { DiscountCodesModule } from '../discount-codes/discount-codes.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Order,
      ShippingPrice
    ]),
    TokenModule,
    BooksModule,
    DiscountCodesModule,
    PaymentsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
