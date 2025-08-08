import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewReaction } from './entities/review-reaction.entity';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewReaction]),
    TokenModule,
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes('*');
  }
}
