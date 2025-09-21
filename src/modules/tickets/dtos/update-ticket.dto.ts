import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { TicketStatuses } from '../ticket.entity';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  response: string;

  @IsOptional()
  @IsEnum(TicketStatuses)
  status?: TicketStatuses;
}
