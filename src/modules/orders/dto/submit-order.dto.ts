import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';
import { PaymentStatuses } from '../entities/order.entity';

export class SubmitOrderDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsNumberString()
  paymentId: string;

  @ApiProperty({ description: 'Just for test' })
  @IsNotEmpty()
  @IsEnum(PaymentStatuses)
  status: PaymentStatuses;

  // TODO: Complete this with payment info
}