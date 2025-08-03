import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewReaction } from './entities/review-reaction.entity';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewReaction]),
    AuthModule,
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
