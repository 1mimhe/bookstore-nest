import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, DeepPartial, EntityNotFoundError, FindOptionsWhere, Repository } from 'typeorm';
import { ConflictDto } from 'src/common/error.dtos';
import { CreateAddressDto } from './dtos/create-address.dto';
import { Address } from './entities/address.entity';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { NotFoundMessages } from 'src/common/enums/error.messages';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { Contact } from './entities/contact.entity';
import { Bookmark, BookmarkTypes } from '../books/entities/bookmark.entity';
import { RecentView, RecentViewTypes } from 'src/common/types/recent-view.type';
import { Title } from '../books/entities/title.entity';
import { Author } from '../authors/author.entity';
import { Publisher } from '../publishers/publisher.entity';
import { Blog } from '../blogs/blog.entity';
import { Character } from '../books/entities/characters.entity';
import { RecentViewDto } from './dtos/recent-view-response.dto';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(Bookmark) private bookmarkRepo: Repository<Bookmark>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    private dataSource: DataSource,
    private authService: AuthService
  ) {}

  findOne(id: string) {
    return this.userRepo.findOne({
      where: { id },
      relations: {
        contact: true,
        roles: true,
      },
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
      select: {
        id: true,
        username: true,
        contact: true
      },
      relations: {
        contact: true
      },
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
        relations: {
          contact: true
        }
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
    const address = this.addressRepo.create({
      userId,
      ...addressDto,
    });
    return this.addressRepo.save(address);
  }

  private async createAddressNewVersion(
    latestVersionId: string,
    addressDto: UpdateAddressDto
  ): Promise<Address> {
    return this.dataSource.transaction(async manager => {
      // Deactivate current active version
      await manager.update(
        Address,
        { id: latestVersionId },
        { isActive: false }
      );
  
      // Create new version
      const newVersion = manager.create(Address, addressDto);
      return this.addressRepo.save(newVersion);
    });
  }

  async getAllUserAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: {
        userId,
        isActive: true
      }
    });
  }

  private async getAddressByIdWithOrderCount(
    id: string
  ): Promise<{ address: Address, orderCount: number } | never> {
    const address = await this.addressRepo.findOneOrFail({
      where: {
        id,
        isActive: true
      }
    }).catch((error: Error) => {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(NotFoundMessages.Address);
      }
      throw error;
    });

    const orderCount = await this.orderRepo.count({
      where: {
        shippingAddressId: id
      }
    });
      
    return {
      address,
      orderCount
    };
  }

  async updateAddress(
    id: string,
    addressDto: UpdateAddressDto
  ): Promise<Address | never> {
    const { orderCount, address } = await this.getAddressByIdWithOrderCount(id);
    Object.assign(address, addressDto);

    if (orderCount < 1) {
      return this.addressRepo.save(address);
    }
    
    return this.createAddressNewVersion(address.id, address);
  }

  async deleteAddress(id: string) {
    const { orderCount, address } = await this.getAddressByIdWithOrderCount(id);

    if (orderCount < 1) {
      return this.addressRepo.softDelete(address);
    }

    return this.addressRepo.update(
      { id },
      { isActive: false }
    );
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

  async getRecentViews(recentViews: RecentView[]): Promise<RecentViewDto[]> {
    const MODEL_MAP = {
      [RecentViewTypes.Title]: Title,
      [RecentViewTypes.Author]: Author,
      [RecentViewTypes.Publisher]: Publisher,
      [RecentViewTypes.Blog]: Blog,
      [RecentViewTypes.Character]: Character,
    } as const;

    const fetchPromises = recentViews
      .filter(view => view?.type && MODEL_MAP[view.type] && view?.slug)
      .map(async (view): Promise<RecentViewDto | null> => {
        const model = MODEL_MAP[view.type];
        
        try {
          const repository = this.dataSource.getRepository(model) as any;
          let entity;
          
          switch (view.type) {
            case RecentViewTypes.Title:
              entity = await (repository as Repository<Title>).findOne({
                where: { slug: view.slug },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  defaultBook: {
                    images: true
                  }
                },
                relations: {
                  defaultBook: {
                    images: true
                  }
                }
              });
              
              if (entity) {
                return {
                  type: view.type,
                  title: entity.name,
                  slug: entity.slug,
                  picUrl: entity.defaultBook?.images?.find((img: any) => img.type === 'main')?.url || null
                };
              }
              break;

            case RecentViewTypes.Author:
              entity = await (repository as Repository<Author>).findOne({
                where: { slug: view.slug },
                select: {
                  firstName: true,
                  lastName: true,
                  slug: true,
                  picUrl: true
                }
              });
              
              if (entity) {
                return {
                  type: view.type,
                  title: `${entity.firstName}${entity.lastName ? ' ' + entity.lastName : ''}`,
                  slug: entity.slug,
                  picUrl: entity.picUrl || null
                };
              }
              break;

            case RecentViewTypes.Publisher:
              entity = await (repository as Repository<Publisher>).findOne({
                where: { slug: view.slug },
                select: {
                  publisherName: true,
                  slug: true,
                  logoUrl: true
                }
              });
              
              if (entity) {
                return {
                  type: view.type,
                  title: entity.publisherName,
                  slug: entity.slug,
                  picUrl: entity.logoUrl || null
                };
              }
              break;

            case RecentViewTypes.Blog:
              entity = await (repository as Repository<Blog>).findOne({
                where: { slug: view.slug },
                select: {
                  subject: true,
                  slug: true,
                  picUrl: true
                }
              });
              
              if (entity) {
                return {
                  type: view.type,
                  title: entity.subject,
                  slug: entity.slug,
                  picUrl: entity.picUrl || null
                };
              }
              break;

            case RecentViewTypes.Character:
              entity = await (repository as Repository<Character>).findOne({
                where: { slug: view.slug },
                select: {
                  fullName: true,
                  slug: true,
                  picUrl: true
                }
              });
              
              if (entity) {
                return {
                  type: view.type,
                  title: entity.fullName,
                  slug: entity.slug,
                  picUrl: entity.picUrl || null
                };
              }
              break;
          }
          
          return null;
        } catch (error) {          
          return null;
        }
      });

    const results = await Promise.all(fetchPromises);
    return results.filter((result): result is RecentViewDto => result !== null);
  }
}
