import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { TokenService } from '../src/modules/token/token.service';
import { CookieService } from '../src/common/services/cookie.service';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn().mockImplementation((body) => {
      if (body.identifier === 'valid@example.com' && body.password === 'ValidPass123!') {
        return Promise.resolve({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          userId: 'user-uuid-1',
          staffId: undefined,
          roles: ['User'],
        });
      }
      throw new BadRequestException('Invalid email or password.');
    }),
  };

  const mockTokenService = {
    generateTokens: jest.fn().mockReturnValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }),
    refreshTokens: jest.fn(),
  };

  const mockCookieService = {
    setCookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: CookieService, useValue: mockCookieService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req: any, _res: any, next: any) => {
      req.session = req.session || {};
      next();
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformInterceptor(reflector));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/signin - should reject empty credentials with 400 Bad Request', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({})
      .expect(400);

    expect(response.body.message).toBeDefined();
  });

  it('POST /auth/signin - should reject invalid credentials with 400 Bad Request', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        identifier: 'wrong@example.com',
        password: 'wrongpassword',
      })
      .expect(400);
  });

  it('POST /auth/signin - should succeed and wrap response in standardized envelope', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        identifier: 'valid@example.com',
        password: 'ValidPass123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('accessToken', 'mock-access-token');
    expect(response.body.data).toHaveProperty('userId', 'user-uuid-1');
  });
});
