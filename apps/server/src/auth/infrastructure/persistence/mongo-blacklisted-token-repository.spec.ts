import { Test, TestingModule } from '@nestjs/testing';
import { MongoBlackListedTokenRepository } from './mongo-blacklisted-token-repository';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlacklistedTokenDocument } from './schemas/blacklisted-token.schema';

describe('MongoBlackListedTokenRepository', () => {
  let repository: MongoBlackListedTokenRepository;
  let mockModel: jest.Mocked<Model<BlacklistedTokenDocument>>;

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoBlackListedTokenRepository,
        {
          provide: getModelToken(BlacklistedTokenDocument.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoBlackListedTokenRepository>(MongoBlackListedTokenRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('blacklist', () => {
    it('should successfully blacklist a token', async () => {
      const token = 'testToken';
      mockModel.create.mockResolvedValue({} as any);

      await repository.blacklist(token);

      expect(mockModel.create).toHaveBeenCalledWith({ token });
    });

    it('should throw an error if blacklisting fails', async () => {
      const token = 'testToken';
      mockModel.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.blacklist(token)).rejects.toThrow('Database error');
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for a blacklisted token', async () => {
      const token = 'blacklistedToken';
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ token }),
      } as any);

      const result = await repository.isBlacklisted(token);

      expect(result).toBe(true);
      expect(mockModel.findOne).toHaveBeenCalledWith({ token });
    });

    it('should return false for a non-blacklisted token', async () => {
      const token = 'nonBlacklistedToken';
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.isBlacklisted(token);

      expect(result).toBe(false);
      expect(mockModel.findOne).toHaveBeenCalledWith({ token });
    });

    it('should throw an error if the database query fails', async () => {
      const token = 'testToken';
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect(repository.isBlacklisted(token)).rejects.toThrow('Database error');
    });
  });
});
