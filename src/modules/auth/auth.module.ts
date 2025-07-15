import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { Contact } from '../users/entities/contact.entity';
import { TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Contact]),
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthService,
  ],
  exports: [
    TokenService,
    AuthService,
  ],
})
export class AuthModule {}
