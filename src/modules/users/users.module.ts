import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Contact } from './entities/contact.entity';
import { Role } from './entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Contact, Role])
  ],
  providers: [
    AuthService,
    UsersService
  ],
  controllers: [UsersController]
})
export class UsersModule {}
