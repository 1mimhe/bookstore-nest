import { Test, TestingModule } from '@nestjs/testing';
import { ViewsService } from './views.service';
import { REDIS_CLIENT } from '../../app/redis.module';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ViewEntityTypes } from '../types/views.types';
import { createMockDataSource } from '../../../../test/mocks/data-source.mock';

describe('ViewsService', () => {
  let service: ViewsService;
  let redisClient: any;
  let dataSource: ReturnType<typeof createMockDataSource>;
  let config: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    dataSource = createMockDataSource();
    config = {
      get: jest.fn().mockReturnValue(1296000000),
    } as any;

    redisClient = {
      exists: jest.fn(),
      setex: jest.fn(),
      get: jest.fn(),
      call: jest.fn(),
      pipeline: jest.fn().mockReturnValue({
        incr: jest.fn(),
        expire: jest.fn(),
        exec: jest.fn().mockResolvedValue([]),
      }),
      scanStream: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewsService,
        { provide: REDIS_CLIENT, useValue: redisClient },
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<ViewsService>(ViewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordView', () => {
    it('should return counted: false if view key already exists', async () => {
      redisClient.exists.mockResolvedValue(1);

      const req = { cookies: { viewer: 'v1' } } as any;
      const res = { cookie: jest.fn() } as any;

      const result = await service.recordView(ViewEntityTypes.Title, 't1', req, res, 'u1');
      expect(result.counted).toBe(false);
    });

    it('should record view and increment counters when not seen before', async () => {
      redisClient.exists.mockResolvedValue(0);
      redisClient.setex.mockResolvedValue('OK');

      const req = { cookies: {} } as any;
      const res = { cookie: jest.fn() } as any;

      const result = await service.recordView(ViewEntityTypes.Title, 't1', req, res);
      expect(result.counted).toBe(true);
      expect(redisClient.setex).toHaveBeenCalled();
      expect(redisClient.pipeline).toHaveBeenCalled();
    });
  });

  describe('getTrendingEntities', () => {
    it('should return parsed result on cache hit', async () => {
      const cached = [{ entityId: 't1', views: 50 }];
      redisClient.get.mockResolvedValue(JSON.stringify(cached));

      const result = await service.getTrendingEntities(ViewEntityTypes.Title);
      expect(result).toEqual(cached);
    });
  });
});
