import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([])
  ],
  providers: [
    UsersService,
    AuthService
  ],
  controllers: [UsersController]
})
export class UsersModule {}
