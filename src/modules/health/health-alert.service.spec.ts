import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthAlertService } from './health-alert.service';

describe('HealthAlertService', () => {
  let service: HealthAlertService;
  let events: { emit: jest.Mock };
  let health: { check: jest.Mock };

  beforeEach(async () => {
    events = { emit: jest.fn() };
    health = { check: jest.fn().mockResolvedValue({ status: 'ok' }) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthAlertService,
        { provide: HealthCheckService, useValue: health },
        { provide: TypeOrmHealthIndicator, useValue: {} },
        { provide: MemoryHealthIndicator, useValue: {} },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();

    service = module.get<HealthAlertService>(HealthAlertService);
  });

  it('should stay silent when all probes pass', async () => {
    await service.pollHealth();

    expect(events.emit).not.toHaveBeenCalled();
  });

  it('should log and emit once while probes keep failing', async () => {
    health.check.mockRejectedValue(new Error('database is down'));
    const loggerSpy = jest
      .spyOn(service['logger'], 'error')
      .mockImplementation(() => undefined);

    await service.pollHealth();
    await service.pollHealth();

    expect(loggerSpy).toHaveBeenCalledTimes(2);
    expect(events.emit).toHaveBeenCalledTimes(1);
    expect(events.emit).toHaveBeenCalledWith(
      'health.degraded',
      expect.objectContaining({ at: expect.any(String) }),
    );
  });

  it('should re-alert after recovery followed by a new failure', async () => {

    health.check.mockRejectedValueOnce(new Error('down'));
    jest.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await service.pollHealth();
    health.check.mockResolvedValueOnce({ status: 'ok' });
    await service.pollHealth();
    health.check.mockRejectedValueOnce(new Error('down again'));
    await service.pollHealth();

    expect(events.emit).toHaveBeenCalledTimes(2);
  });

  it('should degrade to log-only when no emitter is registered', async () => {
    const bare: TestingModule = await Test.createTestingModule({
      providers: [
        HealthAlertService,
        { provide: HealthCheckService, useValue: health },
        { provide: TypeOrmHealthIndicator, useValue: {} },
        { provide: MemoryHealthIndicator, useValue: {} },
      ],
    }).compile();

    const bareService = bare.get<HealthAlertService>(HealthAlertService);
    health.check.mockRejectedValue(new Error('database is down'));

    await expect(bareService.pollHealth()).resolves.toBeUndefined();
  });
});
