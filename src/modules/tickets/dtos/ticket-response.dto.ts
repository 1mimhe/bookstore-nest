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
  priority?: string;

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

  @Expose()
  @Type(() => Object)
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName?: string;
  };

  @Expose()
  @Type(() => Object)
  staff?: {
    id: string;
    employeeId: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName?: string;
    };
  };

  @Expose()
  @Type(() => Object)
  order?: {
    id: string;
    orderStatus: string;
    totalPrice: number;
    finalPrice: number;
  };
}
