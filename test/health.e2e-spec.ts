import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HealthModule } from '../src/modules/health/health.module';
import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  const mockHealthService = {
    check: jest.fn().mockImplementation((_checks) => {
      return Promise.resolve({
        status: 'ok',
        info: { database: { status: 'up' }, memory_heap: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, memory_heap: { status: 'up' } },
      });
    }),
  };

  const mockDbIndicator = {
    pingCheck: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
  };

  const mockMemoryIndicator = {
    checkHeap: jest.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
    checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: 'up' } }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(HealthCheckService)
      .useValue(mockHealthService)
      .overrideProvider(TypeOrmHealthIndicator)
      .useValue(mockDbIndicator)
      .overrideProvider(MemoryHealthIndicator)
      .useValue(mockMemoryIndicator)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health - should return 200 OK with health check indicators', async () => {
    const response = await request(app.getHttpServer())
      .get('/health')
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe('ok');
    expect(response.body.info.database.status).toBe('up');
    expect(response.body.info.memory_heap.status).toBe('up');
  });
});
