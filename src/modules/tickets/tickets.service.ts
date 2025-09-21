import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketResponseDto } from './dtos/ticket-response.dto';
import { Order } from '../orders/entities/order.entity';

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
}
