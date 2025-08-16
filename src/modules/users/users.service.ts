import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';
import { ConflictDto } from 'src/common/dtos/error.dtos';
import { CreateAddressDto } from './dtos/create-address.dto';
import { Address } from './entities/address.entity';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { Contact } from './entities/contact.entity';
import { Bookmark, BookmarkTypes } from '../books/entities/bookmark.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Bookmark) private bookmarkRepo: Repository<Bookmark>,
    private dataSource: DataSource,
    private authService: AuthService
  ) {}

  findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
      relations: ['contact', 'roles'],
    });
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

  async update(
    id: string,
    {
      password,
      email,
      phoneNumber,
      ...userDto
    }: UpdateUserDto
  ): Promise<User | never> {
    return this.dataSource.transaction(async (manager) => {
      const existingUser = await manager.findOne(User, {
        where: { id },
        relations: ['contact']
      });

      if (!existingUser) {
        throw new NotFoundException(NotFoundMessages.User);
      }

      const conflicts = await this.checkUniqueConstraints(
        userDto.username,
        phoneNumber,
        email
      );
      
      if (conflicts.length > 0) {
        throw new ConflictException(conflicts);
      }

      let hashedPassword: string | undefined;
      if (password) {
        hashedPassword = await this.authService.hashPassword(password);
      }
    
      Object.assign(existingUser, {
        ...userDto,
        ...(hashedPassword && { hashedPassword })
      });

      if (email || phoneNumber) {
        if (!existingUser.contact) {
          existingUser.contact = manager.create(Contact, {});
        }
        
        if (email) existingUser.contact.email = email;
        if (phoneNumber) existingUser.contact.phoneNumber = phoneNumber;
      }
    
      return manager.save(existingUser);
    });
  }

  async createAddress(
    userId: string,
    addressDto: CreateAddressDto,
  ): Promise<Address> {
    const logicalId = uuidv4();

    const address = this.addressRepo.create({
      userId,
      logicalId,
      ...addressDto,
    });

    return this.addressRepo.save(address);
  }

  async getAllUserAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.createQueryBuilder('address')
      .where('userId = :userId', { userId })
      .andWhere(
        '(address.addressId, address.version) IN ' +
        '(SELECT addressId, MAX(version) FROM addresses a WHERE a.userId = :userId GROUP BY userId, addressId)'
      )
      .getRawMany();
  }

  async getAddressById(id: string): Promise<Address | never> {
    return this.addressRepo.findOneOrFail({
      where: { id }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Address);
      }
      throw error;
    });
  }

  async updateAddress(
    id: string,
    addressDto: UpdateAddressDto
  ): Promise<Address | never> {
    const address = await this.getAddressById(id);
    Object.assign(address, addressDto);
    return this.addressRepo.save(address);
  }

  async deleteAddress(id: string): Promise<Address | never> {
    const address = await this.getAddressById(id);
    return this.addressRepo.remove(address);
  }

  async getAllBookmarks(
    userId: string,
    type: BookmarkTypes = BookmarkTypes.Library,
    page = 1,
    limit = 10
  ) {
    const skip = (page - 1) * limit;
    const [books, count] = await this.bookmarkRepo.findAndCount({
      where: {
        userId,
        type
      },
      relations: {
        book: true
      },
      skip,
      take: limit
    });

    return {
      count,
      books
    };
  }
}
