import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { TicketsController } from '../src/modules/tickets/controllers/tickets.controller';
import { TicketsService } from '../src/modules/tickets/services/tickets.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { TicketStatuses, TicketTypes } from '../src/modules/tickets/entities/ticket.entity';

describe('TicketsController (e2e)', () => {
  let app: INestApplication;

  const mockTicket = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Order delay',
    description: 'My package has not arrived yet.',
    type: TicketTypes.GeneralInquiry,
    status: TicketStatuses.Open,
    createdAt: new Date().toISOString(),
    user: {
      username: 'customer1',
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockTicketsService = {
    create: jest.fn().mockResolvedValue(mockTicket),
    getAll: jest.fn().mockResolvedValue({
      tickets: [mockTicket],
      total: 1,
    }),
    update: jest.fn().mockResolvedValue({
      ...mockTicket,
      status: TicketStatuses.Closed,
    }),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        { provide: TicketsService, useValue: mockTicketsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.user = { id: 'user-uuid-1', username: 'customer1' };
      req.session = { userId: 'user-uuid-1', staffId: 'staff-1' };
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /tickets', () => {
    it('should create support ticket', async () => {
      const res = await request(app.getHttpServer())
        .post('/tickets')
        .send({
          subject: 'Order delay',
          message: 'My package has not arrived yet.',
          type: TicketTypes.GeneralInquiry,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });
  });

  describe('GET /tickets', () => {
    it('should retrieve tickets list', async () => {
      const res = await request(app.getHttpServer())
        .get('/tickets')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tickets');
    });
  });

  describe('PATCH /tickets/:id', () => {
    it('should update ticket status by staff', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/tickets/${mockTicket.id}`)
        .send({
          status: TicketStatuses.Closed,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('status', TicketStatuses.Closed);
    });
  });

  describe('DELETE /tickets/:id', () => {
    it('should soft delete ticket', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/tickets/${mockTicket.id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });
});
