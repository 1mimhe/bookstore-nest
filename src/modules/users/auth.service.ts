import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from './entities/role.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { pbkdf2, randomBytes } from 'crypto';
import { UsersService } from './users.service';
import { SigninDto } from './dtos/signin.dto';
import { AuthMessages } from 'src/common/enums/auth.messages';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private config: ConfigService
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

  async signin({ identifier, password }: SigninDto) {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new BadRequestException(AuthMessages.InvalidCredentials);
    }
    
    const isCorrectPassword = await this.verifyPassword(password, user.hashedPassword);
    if (!isCorrectPassword) {
      throw new BadRequestException(AuthMessages.InvalidCredentials);
    }

    const payload = {
      sub: user.id,
      username: user.username
    };
    const refreshToken = this.generateRefreshToken(payload);
    const accessToken = this.generateAccessToken(payload);

    return {
      refreshToken,
      accessToken,
      userId: user.id
    };
  }

  private hashPassword(password: string): Promise<string | never> {
    const salt = randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
        if (err) return reject(err);
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
        if (err) return reject(err);        
        const isCorrectPassword = derivedKey.toString('hex') === hash;
        resolve(isCorrectPassword);
      });
    });
  }

  private generateRefreshToken(payload: jwt.JwtPayload, expiresIn = 604_800) {
    expiresIn = expiresIn > 604_800 ? 604_800 : expiresIn;
    const refreshSecretKey = this.config.getOrThrow<string>('JWT_REFRESH_SECRET_KEY');
    
    return jwt.sign(payload, refreshSecretKey, { expiresIn });
  }

  private generateAccessToken(payload: jwt.JwtPayload) {
    const accessSecretKey = this.config.getOrThrow<string>('JWT_ACCESS_SECRET_KEY');
    return jwt.sign(payload, accessSecretKey, { expiresIn: '20min' });
  }

  verifyToken(token: string, type: 'access' | 'refresh') {
    try {
      let secretKey: string;
      if (type = 'access') secretKey =this.config.getOrThrow<string>('JWT_ACCESS_SECRET_KEY');
      else secretKey = this.config.getOrThrow<string>('JWT_REFRESH_SECRET_KEY');

      return jwt.verify(token, secretKey) as jwt.JwtPayload;
    } catch (error) {
      throw new UnauthorizedException(AuthMessages.InvalidToken);
    }
  }
}
