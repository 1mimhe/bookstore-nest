import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entities/role.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { pbkdf2, randomBytes } from 'crypto';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async signup(userDto: CreateUserDto, roles: Roles[] = [Roles.Customer]) {
    const { password, email, phoneNumber, ...userData } = userDto;

    const conflicts = await this.usersService.checkUniqueConstraints(userData.username, phoneNumber, email);
    if (conflicts.length > 0) {
      throw new ConflictException(conflicts);
    }

    const hashedPassword = await this.hashPassword(password);
    const user = this.userRepo.create({
      ...userData,
      hashedPassword,
      contact: {
        phoneNumber,
        email,
      },
      roles: roles.map((role) => ({ role })),
    });

    return this.userRepo.save(user);
  }

  private hashPassword(password: string): Promise<string | never> {
    const salt = randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  private verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean | never> {
    return new Promise((resolve, reject) => {
      const [salt, hash] = hashedPassword.split(':');

      if (!salt || !hash) {
        reject(new Error('Stored hash is in invalid format.'));
      }

      pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        const isCorrectPassword = derivedKey.toString('hex') === hash;
        resolve(isCorrectPassword);
      });
    });
  }
}
