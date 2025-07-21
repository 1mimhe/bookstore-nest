import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { PublishersController } from './publishers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from './publisher.entity';
import { AuthModule } from '../auth/auth.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publisher]),
    AuthModule,
    BooksModule
  ],
  providers: [PublishersService],
  controllers: [PublishersController]
})
export class PublishersModule {}
