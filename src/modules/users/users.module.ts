import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';
import { AuthModule } from '../auth/auth.module';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address]),
    AuthModule
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