import { Test, TestingModule } from '@nestjs/testing';
import { DiscountCodesService } from './discount-codes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DiscountCode, DiscountCodeType } from '../entities/discount-code.entity';
import { DataSource } from 'typeorm';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DiscountCodesService', () => {
  let service: DiscountCodesService;
  let repo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;

  beforeEach(async () => {
    repo = createMockRepository();
    dataSource = createMockDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscountCodesService,
        { provide: getRepositoryToken(DiscountCode), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<DiscountCodesService>(DiscountCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if end date is before start date', async () => {
      const dto = {
        code: 'TEST20',
        type: DiscountCodeType.Percentage,
        value: 0.2,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-09-01'),
      };
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if percentage value is greater than 1', async () => {
      const dto = {
        code: 'TEST20',
        type: DiscountCodeType.Percentage,
        value: 1.5,
      };
      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should create valid percentage discount code', async () => {
      const dto = {
        code: 'SAVE20',
        type: DiscountCodeType.Percentage,
        value: 0.2,
      };
      dataSource.manager.create.mockReturnValue(dto);
      dataSource.manager.save.mockResolvedValue({ id: 'dc-1', ...dto });

      const result = await service.create(dto as any);
      expect(result).toHaveProperty('id', 'dc-1');
    });
  });

  describe('check and apply', () => {
    it('should calculate percentage discount correctly', async () => {
      const mockCode: Partial<DiscountCode> = {
        code: 'SPRING20',
        type: DiscountCodeType.Percentage,
        value: 0.2,
        isActive: true,
        usedCount: 0,
        users: [],
      };
      repo.findOne.mockResolvedValue(mockCode as DiscountCode);

      const checkResult = await service.check({ code: 'SPRING20', finalPrice: 100 }, 'user-1');
      expect(checkResult.isValid).toBe(true);
      expect(checkResult.discountAmount).toBe(20);
      expect(checkResult.finalPrice).toBe(80);
    });

    it('should calculate fixed amount discount correctly', async () => {
      const mockCode: Partial<DiscountCode> = {
        code: 'SAVE15',
        type: DiscountCodeType.FixedAmount,
        value: 15,
        isActive: true,
        usedCount: 0,
        users: [],
      };
      repo.findOne.mockResolvedValue(mockCode as DiscountCode);

      const checkResult = await service.check({ code: 'SAVE15', finalPrice: 50 }, 'user-1');
      expect(checkResult.isValid).toBe(true);
      expect(checkResult.discountAmount).toBe(15);
      expect(checkResult.finalPrice).toBe(35);
    });

    it('should return isValid=false when discount code is not active', async () => {
      const mockCode: Partial<DiscountCode> = {
        code: 'EXPIRED',
        isActive: false,
      };
      repo.findOne.mockResolvedValue(mockCode as DiscountCode);

      const checkResult = await service.check({ code: 'EXPIRED', finalPrice: 100 }, 'user-1');
      expect(checkResult.isValid).toBe(false);
      expect(checkResult.message).toContain('not active');
    });

    it('should apply discount and increment usedCount', async () => {
      const mockCode: Partial<DiscountCode> = {
        code: 'SUMMER10',
        type: DiscountCodeType.Percentage,
        value: 0.1,
        isActive: true,
        usedCount: 0,
        users: [],
      };
      repo.findOne.mockResolvedValue(mockCode as DiscountCode);
      repo.increment.mockResolvedValue({} as any);

      const result = await service.apply('SUMMER10', 200, 'user-1');
      expect(result.discountAmount).toBe(20);
      expect(result.finalPrice).toBe(180);
      expect(repo.increment).toHaveBeenCalledWith({ code: 'SUMMER10' }, 'usedCount', 1);
    });
  });

  describe('delete', () => {
    it('should soft delete discount code', async () => {
      const code = { id: 'dc-1' };
      repo.findOne.mockResolvedValue(code);
      repo.softRemove.mockResolvedValue(code);

      await service.delete('dc-1');
      expect(repo.softRemove).toHaveBeenCalledWith(code);
    });

    it('should throw NotFoundException if code does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.delete('invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
