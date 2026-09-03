import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesService } from './languages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Language } from '../entities/language.entity';
import { createMockRepository } from '../../../../test/mocks/repository.mock';
import { ConflictException } from '@nestjs/common';
import { DBErrors } from 'src/common/enums/db.errors';

describe('LanguagesService', () => {
  let service: LanguagesService;
  let repo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    repo = createMockRepository();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        { provide: getRepositoryToken(Language), useValue: repo },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return language entity', async () => {
      const dto = { code: 'en', persianName: 'انگلیسی', englishName: 'English' };
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ id: 'lang-1', ...dto });

      const result = await service.create(dto as any);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'lang-1');
    });

    it('should throw ConflictException on unique constraint failure', async () => {
      const dto = { code: 'en', persianName: 'انگلیسی', englishName: 'English' };
      repo.create.mockReturnValue(dto);
      repo.save.mockRejectedValue({ code: DBErrors.Conflict });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should rethrow unknown errors', async () => {
      const dto = { code: 'en', persianName: 'انگلیسی', englishName: 'English' };
      repo.create.mockReturnValue(dto);
      repo.save.mockRejectedValue(new Error('DB failure'));

      await expect(service.create(dto as any)).rejects.toThrow('DB failure');
    });
  });

  describe('getAll', () => {
    it('should return an array of languages', async () => {
      const mockList = [{ id: '1', code: 'en' }, { id: '2', code: 'fa' }];
      repo.find.mockResolvedValue(mockList);

      const result = await service.getAll();
      expect(result).toEqual(mockList);
      expect(repo.find).toHaveBeenCalled();
    });
  });
});
