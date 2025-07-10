import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
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
import { JwtPayload } from 'src/common/types/jwt';
import { SessionData } from 'express-session';
import { Publisher } from '../publishers/entities/publisher.entity';

type AdditionalEntity = Publisher;

@Injectable()
export class AuthService {
  private accessSecretKey: string;
  private refreshSecretKey: string;

  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
    config: ConfigService,
  ) {
    this.accessSecretKey = config.getOrThrow<string>('JWT_ACCESS_SECRET_KEY');
    this.refreshSecretKey = config.getOrThrow<string>('JWT_REFRESH_SECRET_KEY');
  }

  // async signup(userDto: CreateUserDto, roles: Roles[] = [Roles.Customer]) {
  //   const { password, email, phoneNumber, ...userData } = userDto;

  //   const conflicts = await this.usersService.checkUniqueConstraints(
  //     userData.username,
  //     phoneNumber,
  //     email,
  //   );
  //   if (conflicts.length > 0) {
  //     throw new ConflictException(conflicts);
  //   }

  //   const hashedPassword = await this.hashPassword(password);
  //   const user = this.userRepo.create({
  //     ...userData,
  //     hashedPassword,
  //     contact: {
  //       phoneNumber,
  //       email,
  //     },
  //     roles: roles.map((role) => ({ role })),
  //   });

  //   return this.userRepo.save(user);
  // }

    async signup(
    userDto: CreateUserDto, 
    roles: Roles[] = [Roles.Customer],
    additionalEntityCallback?: (user: User, manager: EntityManager) => Promise<AdditionalEntity>
  ) {
    const { password, email, phoneNumber, ...userData } = userDto;
    
    return this.dataSource.transaction(async (manager) => {
      const conflicts = await this.usersService.checkUniqueConstraints(
        userData.username,
        phoneNumber,
        email
      );
      
      if (conflicts.length > 0) {
        throw new ConflictException(conflicts);
      }

      const hashedPassword = await this.hashPassword(password);
      
      const user = manager.create(User, {
        ...userData,
        hashedPassword,
        contact: {
          phoneNumber,
          email,
        },
        roles: roles.map((role) => ({ role })),
      });
      const savedUser = await manager.save(user);
      
      let additionalEntity: AdditionalEntity | undefined = undefined;
      if (additionalEntityCallback) {
        additionalEntity = await additionalEntityCallback(savedUser, manager);
      }
      
      return savedUser ?? additionalEntity;
    });
  }

  async signin({ identifier, password }: SigninDto) {
    const user = await this.usersService.findByIdentifier(identifier);

    if (!user) {
      throw new BadRequestException(AuthMessages.InvalidCredentials);
    }

    const isCorrectPassword = await this.verifyPassword(
      password,
      user.hashedPassword,
    );
    if (!isCorrectPassword) {
      throw new BadRequestException(AuthMessages.InvalidCredentials);
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };
    const refreshToken = this.generateRefreshToken(payload);
    const accessToken = this.generateAccessToken(payload);

    return {
      refreshToken,
      accessToken,
      userId: user.id,
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

  private generateRefreshToken(payload: JwtPayload, expiresIn = 1_296_000 /* 15days */) {
    expiresIn = Math.min(1_296_000, expiresIn);
    const refreshSecretKey = this.refreshSecretKey
    return jwt.sign(payload, refreshSecretKey, { expiresIn });
  }

  private generateAccessToken(payload: JwtPayload, expiresIn = 1200 /* 20min */) {
    expiresIn = Math.min(1200, expiresIn);
    const accessSecretKey = this.accessSecretKey
    return jwt.sign(payload, accessSecretKey, { expiresIn });
  }

  verifyToken(token: string, type: 'access' | 'refresh') {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException(`Invalid ${type} token format.`);
    }

    try {
      const secretKey = type === 'access' ? this.accessSecretKey : this.refreshSecretKey;
      return jwt.verify(token, secretKey) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException(`${type} token has expired`);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid ${type} token.`);
      }
      throw new UnauthorizedException(`${type} token verification failed.`);
    }
  }

  refreshTokens(oldRefreshToken: string, session: SessionData) {
    if (!(session.userId && oldRefreshToken)) {
      throw new ForbiddenException(AuthMessages.AccessDenied);
    }

    const sessionRefreshToken = session.refreshToken;
    if (!(sessionRefreshToken) || (oldRefreshToken !== sessionRefreshToken)) {
      throw new UnauthorizedException(AuthMessages.InvalidRefreshToken);
    }

    const expirationTime = session.cookie.expires
      ? new Date(session.cookie.expires).getTime() - Date.now()
      : 0;
   
    const { sub, username } = this.verifyToken(oldRefreshToken, 'refresh');
    const payload = { sub, username };
    const newRefreshToken = this.generateRefreshToken(payload, Math.trunc(expirationTime / 1000));
    const newAccessToken = this.generateAccessToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expirationTime
    };
  }
}
