import { Expose, Type } from 'class-transformer';
import { TicketTypes, TicketStatuses } from '../ticket.entity';

export class TicketResponseDto {
  @Expose()
  id: string;

  @Expose()
  type: TicketTypes;

  @Expose()
  message: string;

  @Expose()
  response?: string;

  @Expose()
  status: TicketStatuses;

  @Expose()
  subject?: string;

  @Expose()
  orderId?: string;

  @Expose()
  userId: string;

  @Expose()
  staffId?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
