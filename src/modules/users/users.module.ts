import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CurrentUserMiddleware } from '../../common/current-user.middleware';
import { AuthModule } from '../auth/auth.module';
import { Address } from './entities/address.entity';
import { ReviewReaction } from '../reviews/entities/review-reaction.entity';
import { Bookmark } from '../books/entities/bookmark.entity';
import { Staff } from '../staffs/entities/staff.entity';
import { StaffAction } from '../staffs/entities/staff-action.entity';
import { TokenModule } from '../token/token.module';
import { Order } from '../orders/entities/order.entity';
import { OrderBook } from '../orders/entities/order-book.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Address,
      ReviewReaction,
      Bookmark,
      Staff,
      StaffAction,
      Order,
      OrderBook,
    ]),
    AuthModule,
    TokenModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService]
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}