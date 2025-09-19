import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DiscountCode } from './discount-code.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { CreateDiscountCodeDto } from './dtos/create-discount-code.dto';
import { DiscountCodeType } from './discount-code.entity';
import { dbErrorHandler } from 'src/common/utilities/error-handler';
import { DiscountCodeQueryDto } from './dtos/discount-code-query.dto';

@Injectable()
export class DiscountCodesService {
  constructor(
    @InjectRepository(DiscountCode) private discountCodeRepo: Repository<DiscountCode>,
    private dataSource: DataSource,
  ) {}

  async create(
    {
      userIds,
      ...discountCodeDto
    }: CreateDiscountCodeDto
  ): Promise<DiscountCode> {
    return this.dataSource.transaction(async (manager) => {
      // Check start and end dates
      if (discountCodeDto.startDate && discountCodeDto.endDate) {
        if (new Date(discountCodeDto.startDate) >= new Date(discountCodeDto.endDate)) {
          throw new BadRequestException('End date must be after start date.');
        }
      }

      // Check percentage value
      if (
        discountCodeDto.type === DiscountCodeType.Percentage
        && discountCodeDto.value > 1
      ) {
        throw new BadRequestException('Percentage value must be between 0 and 1.');
      }

      // Check min/max purchase
      if (discountCodeDto.minPurchase && discountCodeDto.maxPurchase && 
          discountCodeDto.minPurchase > discountCodeDto.maxPurchase) {
        throw new BadRequestException('Min purchase must be less than or equal to max purchase.');
      }

      // Check users existence
      let users: User[] = [];
      if (userIds && userIds.length > 0) {
        users = await manager.findBy(User, { id: In(userIds) });
        if (users.length !== userIds.length) {
          throw new NotFoundException('Some users not found.');
        }
      }

      const discountCode = manager.create(DiscountCode, 
        {
          ...discountCodeDto,
          users,
        }
      );
      return manager.save(DiscountCode, discountCode);
    }).catch((error) => {
      dbErrorHandler(error);
      throw error;
    });
  }

  async getAll(query: DiscountCodeQueryDto): Promise<DiscountCode[]> {
    const { page = 1, limit = 10, search, isActive, type, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const qb = this.discountCodeRepo.createQueryBuilder('discountCode');

    if (search) {
      qb.andWhere(
        'LOWER(discountCode.code) LIKE LOWER(:search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      qb.andWhere('discountCode.isActive = :isActive', { isActive });
    }

    if (type) {
      qb.andWhere('discountCode.type = :type', { type });
    }

    if (startDate) {
      qb.andWhere('discountCode.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('discountCode.endDate <= :endDate', { endDate });
    }

    return qb
      .orderBy('discountCode.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();
  }
}
