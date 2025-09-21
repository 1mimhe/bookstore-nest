import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { TicketTypes } from '../ticket.entity';

export class CreateTicketDto {
  @IsNotEmpty()
  @IsEnum(TicketTypes)
  type: TicketTypes;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  priority?: string;
}
