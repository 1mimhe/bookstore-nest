import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketResponseDto } from './dtos/ticket-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { RolesEnum } from '../users/entities/role.entity';

@ApiTags('Ticket')
@Controller('tickets')
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @ApiOperation({
    summary: 'Create a new ticket'
  })
  @ApiBadRequestResponse({ type: ValidationErrorResponseDto })
  @Serialize(TicketResponseDto)
  @UseGuards(AuthGuard, RolesGuard)
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.Customer
  )
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createTicket(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser('id') userId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.create(createTicketDto, userId);
  }
}
