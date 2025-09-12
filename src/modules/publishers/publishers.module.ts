import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { PublishersController } from './publishers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from './publisher.entity';
import { AuthModule } from '../auth/auth.module';
import { BooksModule } from '../books/books.module';
import { TokenModule } from '../token/token.module';
import { BlogsModule } from '../blogs/blogs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publisher]),
    AuthModule,
    BooksModule,
    TokenModule,
    BlogsModule
  ],
  providers: [PublishersService],
  controllers: [PublishersController]
})
export class PublishersModule {}
