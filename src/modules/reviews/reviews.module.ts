import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewReaction } from './entities/review-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewReaction])],
  controllers: [ReviewsController],
  providers: [ReviewsService]
})
export class ReviewsModule {}
