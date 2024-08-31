import { Test, TestingModule } from '@nestjs/testing';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('BcryptPasswordHasher', () => {
  let service: BcryptPasswordHasher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptPasswordHasher],
    }).compile();

    service = module.get<BcryptPasswordHasher>(BcryptPasswordHasher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should hash password', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hash(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare(password, hashedPassword);

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testPassword';
      const hashedPassword = 'hashedPassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare(password, hashedPassword);

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });
  });
});
