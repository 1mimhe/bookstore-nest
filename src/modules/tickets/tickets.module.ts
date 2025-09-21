import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './ticket.entity';
import { Order } from '../orders/entities/order.entity';
import { Staff } from '../staffs/entities/staff.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Ticket,
      Order,
      Staff,
    ]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService],
})
export class TicketsModule {}
