import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketTypes, TicketStatuses } from '../ticket.entity';

export class TicketQueryDto {
  @IsOptional()
  @IsEnum(TicketTypes)
  type?: TicketTypes;

  @IsOptional()
  @IsEnum(TicketStatuses)
  status?: TicketStatuses;

  @IsOptional()
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
