import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, TicketStatuses } from './ticket.entity';
import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { TicketResponseDto } from './dtos/ticket-response.dto';
import { Order } from '../orders/entities/order.entity';
import { UpdateTicketDto } from './dtos/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private dataSource: DataSource,
  ) {}

  async create(
    ticketDto: CreateTicketDto,
    userId: string,
  ): Promise<TicketResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      if (ticketDto.orderId) {
        const order = await manager.findOne(Order, {
          where: { id: ticketDto.orderId, userId },
        });
        if (!order) {
          throw new BadRequestException('Order not found or does not belong to user.');
        }
      }

      const ticket = manager.create(Ticket, {
        ...ticketDto,
        userId,
      });

      return manager.save(Ticket, ticket);
    });
  }

  async getAll(
    {
      page = 1,
      limit = 10,
      ...query
    }: TicketQueryDto,
    userId?: string,
    isStaff: boolean = false,
  ): Promise<{ tickets: TicketResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const qb = this.ticketRepo
    .createQueryBuilder('ticket')
    .leftJoinAndSelect('ticket.user', 'user')
    .leftJoinAndSelect('ticket.staff', 'staff')
    .leftJoinAndSelect('staff.user', 'staffUser')
    .leftJoinAndSelect('ticket.order', 'order');

    // Apply filters
    this.addFilters(qb, query, isStaff, userId);

    const [tickets, total] = await qb
      .skip(skip)
      .limit(limit)
      .getManyAndCount();
    return {
      tickets,
      total,
    };
  }

  private addFilters(
    qb: SelectQueryBuilder<Ticket>,
    query: TicketQueryDto,
    isStaff: boolean,
    userId?: string,
  ): void {
    // Apply filters
    if (query.type) {
      qb.andWhere('ticket.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }

    if (query.orderId) {
      qb.andWhere('ticket.orderId = :orderId', { orderId: query.orderId });
    }

    // If not staff, only show user's own tickets
    if (!isStaff && userId) {
      qb.andWhere('ticket.userId = :userId', { userId });
    }

    // Apply sorting
    qb.orderBy(`ticket.createdAt`, 'DESC');
  }

  async update(
    id: string,
    ticketDto: UpdateTicketDto,
    staffId: string
  ): Promise<TicketResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const queryBuilder = manager
        .createQueryBuilder(Ticket, 'ticket')
        .where('ticket.id = :id', { id });

      const ticket = await queryBuilder.getOne();

      if (!ticket) {
        throw new NotFoundException('Ticket not found.');
      }

      ticketDto['staffId'] = staffId;

      Object.assign(ticket, ticketDto);
      return manager.save(Ticket, ticket);
    });
  }

  async delete(
    id: string,
    userId?: string,
    isStaff: boolean = false
  ): Promise<void> {
    const queryBuilder = this.ticketRepo
      .createQueryBuilder('ticket')
      .where('ticket.id = :id', { id });

    if (!isStaff && userId) {
      queryBuilder.andWhere('ticket.userId = :userId', { userId });
    }

    const ticket = await queryBuilder.getOne();

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (ticket.status === TicketStatuses.Closed) {
      throw new BadRequestException('You can not delete a closed ticket.');
    }

    await this.ticketRepo.softDelete(id);
  }
}
