import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Contact } from './entities/contact.entity';
import { Role } from './entities/role.entity';
import { CurrentUserMiddleware } from 'src/common/middlewares/current-user.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, Role])
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