import { TokenService } from './token.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RolesEnum } from '../../users/entities/role.entity';

describe('TokenService', () => {
  let service: TokenService;
  let config: jest.Mocked<ConfigService>;
  const accessSecret = 'access-test-secret-1234567890';
  const refreshSecret = 'refresh-test-secret-1234567890';

  beforeEach(() => {
    config = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'JWT_ACCESS_SECRET_KEY') return accessSecret;
        if (key === 'JWT_REFRESH_SECRET_KEY') return refreshSecret;
        throw new Error(`Missing ${key}`);
      }),
    } as any;

    service = new TokenService(config);
  });

  it('should generate valid access token', () => {
    const payload = { sub: 'user-123', username: 'john', roles: [RolesEnum.Customer] };
    const token = service.generateAccessToken(payload);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, accessSecret) as any;
    expect(decoded.sub).toBe('user-123');
    expect(decoded.username).toBe('john');
  });

  it('should generate valid refresh token', () => {
    const payload = { sub: 'user-123', username: 'john', roles: [RolesEnum.Customer] };
    const token = service.generateRefreshToken(payload);
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, refreshSecret) as any;
    expect(decoded.sub).toBe('user-123');
  });

  describe('verifyToken', () => {
    it('should verify correct access token', () => {
      const token = jwt.sign({ sub: 'user-1' }, accessSecret);
      const verified = service.verifyToken(token, 'access');
      expect(verified.sub).toBe('user-1');
    });

    it('should throw UnauthorizedException on invalid token format', () => {
      expect(() => service.verifyToken('', 'access')).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on expired token', () => {
      const expiredToken = jwt.sign({ sub: 'user-1' }, accessSecret, { expiresIn: -10 });
      expect(() => service.verifyToken(expiredToken, 'access')).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong secret', () => {
      const wrongToken = jwt.sign({ sub: 'user-1' }, 'wrong-secret');
      expect(() => service.verifyToken(wrongToken, 'access')).toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should throw ForbiddenException if session has no userId', () => {
      expect(() => service.refreshTokens('token', {} as any)).toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if session refreshToken does not match', () => {
      const session = { userId: '123', refreshToken: 'tokenA', cookie: {} } as any;
      expect(() => service.refreshTokens('tokenB', session)).toThrow(UnauthorizedException);
    });

    it('should refresh tokens when session matches', () => {
      const token = jwt.sign({ sub: 'user-1', username: 'john', roles: [] }, refreshSecret, { expiresIn: 3600 });
      const session = {
        userId: 'user-1',
        refreshToken: token,
        cookie: { expires: new Date(Date.now() + 3600 * 1000) },
      } as any;

      const result = service.refreshTokens(token, session);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expirationTime');
    });
  });
});
