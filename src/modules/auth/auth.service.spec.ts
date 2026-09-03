import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { RolesEnum } from '../users/entities/role.entity';
import { createMockRepository } from '../../../test/mocks/repository.mock';
import { createMockDataSource } from '../../../test/mocks/data-source.mock';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof createMockRepository>;
  let tokenService: Partial<TokenService>;

  beforeEach(async () => {
    userRepo = createMockRepository();
    tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: TokenService, useValue: tokenService },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: DataSource, useValue: createMockDataSource() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash password using bcrypt', async () => {
      const password = 'Password123!';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith('$2')).toBe(true);
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });
  });

  describe('signin', () => {
    it('should authenticate successfully with valid bcrypt credentials', async () => {
      const rawPassword = 'SecretPassword123!';
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const mockUser = {
        id: 'user-uuid-1',
        username: 'testuser',
        hashedPassword,
        roles: [{ role: RolesEnum.Customer }],
        staff: null,
      };

      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.signin({
        identifier: 'testuser',
        password: rawPassword,
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe('user-uuid-1');
      expect(result.roles).toEqual([RolesEnum.Customer]);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should throw BadRequestException if user is not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.signin({
          identifier: 'nonexistent',
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword!', 10);

      userRepo.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        username: 'testuser',
        hashedPassword,
        roles: [{ role: RolesEnum.Customer }],
      });

      await expect(
        service.signin({
          identifier: 'testuser',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should verify legacy PBKDF2 password and upgrade to bcrypt', async () => {
      // Legacy PBKDF2 format: salt:hash
      // We can generate a quick PBKDF2 hash
      const { pbkdf2 } = await import('crypto');
      const salt = '1234567890abcdef1234567890abcdef';
      const rawPassword = 'LegacyPassword123!';

      const derivedHash: string = await new Promise((resolve) => {
        pbkdf2(rawPassword, salt, 1000, 64, 'sha512', (_, key) => {
          resolve(key.toString('hex'));
        });
      });

      const legacyHash = `${salt}:${derivedHash}`;

      userRepo.findOne.mockResolvedValue({
        id: 'legacy-user-uuid',
        username: 'legacyuser',
        hashedPassword: legacyHash,
        roles: [{ role: RolesEnum.Customer }],
      });

      const result = await service.signin({
        identifier: 'legacyuser',
        password: rawPassword,
      });

      expect(result.userId).toBe('legacy-user-uuid');
      expect(userRepo.update).toHaveBeenCalledWith(
        'legacy-user-uuid',
        expect.objectContaining({
          hashedPassword: expect.stringMatching(/^\$2/),
        }),
      );
    });
  });
});
