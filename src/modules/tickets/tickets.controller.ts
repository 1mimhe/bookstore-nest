import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketQueryDto } from './dtos/ticket-query.dto';
import { TicketResponseDto } from './dtos/ticket-response.dto';
import { Serialize } from 'src/common/serialize.interceptor';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequiredRoles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ValidationErrorResponseDto } from 'src/common/error.dtos';
import { ApiQueryPagination } from 'src/common/decorators/query.decorators';
import { RolesEnum } from '../users/entities/role.entity';
import { SessionData } from 'express-session';
import { UpdateTicketDto } from './dtos/update-ticket.dto';

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

  @ApiOperation({ summary: 'Get all tickets' })
  @ApiOkResponse({ type: [TicketResponseDto] })
  @ApiQueryPagination()
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.OrderManager,
    RolesEnum.Customer
  )
  @UseGuards(AuthGuard, RolesGuard)
  @Serialize(TicketResponseDto)
  @Get()
  async getAllTickets(
    @Query() query: TicketQueryDto,
    @Session() session: SessionData,
    @CurrentUser('id') userId: string,
  ): Promise<{ tickets: TicketResponseDto[]; total: number }> {
    return this.ticketsService.getAll(query, userId, Boolean(session.staffId));
  }

  @ApiOperation({ summary: 'Update a ticket (Only for staff)' })
  @ApiQueryPagination()
  @RequiredRoles(
    RolesEnum.Admin,
    RolesEnum.OrderManager,
  )
  @UseGuards(AuthGuard, RolesGuard)
  @Serialize(TicketResponseDto)
  @Patch(':id')
  async updateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTicketDto,
    @Session() session: SessionData,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.update(id, body, session.staffId!);
  }
}
