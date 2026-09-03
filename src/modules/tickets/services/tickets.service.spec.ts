import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket, TicketStatuses } from '../entities/ticket.entity';
import { DataSource } from 'typeorm';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let repo: ReturnType<typeof createMockRepository>;
  let dataSource: ReturnType<typeof createMockDataSource>;

  beforeEach(async () => {
    repo = createMockRepository();
    dataSource = createMockDataSource();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: repo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket without orderId', async () => {
      const dto = { title: 'Issue', description: 'Problem description' };
      const savedTicket = { id: 'ticket-1', ...dto, userId: 'user-1' };
      dataSource.manager.create.mockReturnValue(savedTicket);
      dataSource.manager.save.mockResolvedValue(savedTicket);

      const result = await service.create(dto as any, 'user-1');
      expect(result).toEqual(savedTicket);
      expect(dataSource.manager.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if orderId does not belong to user', async () => {
      const dto = { title: 'Order Issue', description: 'Desc', orderId: 'ord-1' };
      dataSource.manager.findOne.mockResolvedValue(null);

      await expect(service.create(dto as any, 'user-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    let qb: any;

    beforeEach(() => {
      qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
    });

    it('should throw BadRequestException when trying to delete a closed ticket', async () => {
      const mockTicket = { id: 't1', status: TicketStatuses.Closed };
      qb.getOne.mockResolvedValue(mockTicket);

      await expect(service.delete('t1', 'user-1', false)).rejects.toThrow(BadRequestException);
    });

    it('should soft delete open ticket', async () => {
      const mockTicket = { id: 't1', status: TicketStatuses.Open };
      qb.getOne.mockResolvedValue(mockTicket);

      await service.delete('t1', 'user-1', false);
      expect(repo.softDelete).toHaveBeenCalledWith('t1');
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      qb.getOne.mockResolvedValue(null);
      await expect(service.delete('t-none', 'user-1', false)).rejects.toThrow(NotFoundException);
    });
  });
});
