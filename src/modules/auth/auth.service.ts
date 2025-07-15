import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { DataSource, EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/sign-up.dto';
import { pbkdf2, randomBytes } from 'crypto';
import { SigninDto } from './dto/sign-in.dto';
import { AuthMessages } from 'src/common/enums/auth.messages';
import { Publisher } from '../publishers/entities/publisher.entity';
import { User } from '../users/entities/user.entity';
import { Roles } from '../users/entities/role.entity';
import { TokenService } from './token.service';
import { ConflictDto } from 'src/common/dtos/error.dtos';

type AdditionalEntity = Publisher;

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    @InjectRepository(User) private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async signup(
    userDto: CreateUserDto,
    roles?: Roles[]
  ): Promise<User>;

  async signup<T extends AdditionalEntity>(
    userDto: CreateUserDto,
    roles: Roles[],
    additionalEntityCallback: (user: User, manager: EntityManager) => Promise<T>
  ): Promise<T>;

  async signup<T extends AdditionalEntity>(
    userDto: CreateUserDto, 
    roles: Roles[] = [Roles.Customer],
    additionalEntityCallback?: (user: User, manager: EntityManager) => Promise<T>
  ): Promise<User | T> {
    const { password, email, phoneNumber, ...userData } = userDto;
    
    return this.dataSource.transaction(async (manager) => {
      const conflicts = await this.checkUniqueConstraints(
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
      
      let additionalEntity: T | undefined = undefined;
      if (additionalEntityCallback) {
        additionalEntity = await additionalEntityCallback(savedUser, manager);
      }
      
      return additionalEntity ?? savedUser;
    });
  }

  async signin({ identifier, password }: SigninDto) {
    const user = await this.userRepo.findOne({
      where: [
        { username: identifier },
        { contact: { email: identifier } },
        { contact: { phoneNumber: identifier } },
      ],
      select: ['id', 'username', 'hashedPassword'],
      relations: ['contact'],
    });

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
    const refreshToken = this.tokenService['generateRefreshToken'](payload);
    const accessToken = this.tokenService['generateAccessToken'](payload);

    return {
      refreshToken,
      accessToken,
      userId: user.id,
    };
  }

  async checkUniqueConstraints(
    username?: string,
    phoneNumber?: string,
    email?: string,
  ) {
    const conflicts: ConflictDto[] = [];
    const whereConditions: FindOptionsWhere<User>[] = [];

    if (username) {
      whereConditions.push({ username });
    }

    if (email) {
      whereConditions.push({ contact: { email } });
    }

    if (phoneNumber) {
      whereConditions.push({ contact: { phoneNumber } });
    }

    const existingUsers = await this.userRepo.find({
      where: whereConditions,
      select: ['id', 'username'],
      relations: ['contact'],
    });

    if (existingUsers.length === 0) {
      return conflicts;
    }

    for (const user of existingUsers) {
      if (username && user.username === username) {
        conflicts.push({
          field: 'username',
          value: username,
          message: `Username '${username}' is already taken`,
        });
      }

      if (email && user.contact?.email === email) {
        conflicts.push({
          field: 'email',
          value: email,
          message: `Email '${email}' is already registered`,
        });
      }

      if (phoneNumber && user.contact?.phoneNumber === phoneNumber) {
        conflicts.push({
          field: 'phoneNumber',
          value: phoneNumber,
          message: `Phone number '${phoneNumber}' is already registered`,
        });
      }
    }

    return conflicts;
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
}
