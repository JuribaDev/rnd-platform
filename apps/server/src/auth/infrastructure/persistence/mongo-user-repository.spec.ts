import { Test, TestingModule } from '@nestjs/testing';
import { MongoUserRepository } from './mongo-user-repository';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { User } from '../../domain/entities/user.entity';

describe('MongoUserRepository', () => {
  let repository: MongoUserRepository;
  let mockModel: jest.Mocked<Model<UserDocument>>;

  beforeEach(async () => {
    mockModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoUserRepository,
        {
          provide: getModelToken(UserDocument.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoUserRepository>(MongoUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const now = new Date();
      const user = new User('', 'test@example.com', 'test user', 'hashedPassword', now);
      const createdUser = {
        _id: 'generatedId',
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: now,
        lastLogin: user.lastLogin,
      };

      mockModel.create.mockResolvedValue({
        ...createdUser,
        toObject: () => createdUser,
      } as any);

      const result = await repository.create(user);

      expect(result).toEqual(expect.objectContaining({
        id: 'generatedId',
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: now,
      }));
      expect(mockModel.create).toHaveBeenCalledWith(expect.objectContaining({
        email: user.email,
        name: user.name,
        password: user.password,
        createdAt: now,
      }));
    });

    it('should throw an error if user creation fails', async () => {
      const user = new User('', 'test@example.com', 'test user','hashedPassword', new Date());
      mockModel.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(user)).rejects.toThrow('Database error');
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const email = 'test@example.com';
      const user = {
        _id: 'userId',
        email,
        name: 'Test User',
        password: 'hashedPassword',
        createdAt: new Date(),
      };

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      } as any);

      const result = await repository.findByEmail(email);

      expect(result).toEqual(expect.objectContaining({
        id: 'userId',
        email,
        password: 'hashedPassword',
        createdAt: expect.any(Date),
      }));
      expect(mockModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should return null if user is not found', async () => {
      const email = 'nonexistent@example.com';

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const result = await repository.findByEmail(email);

      expect(result).toBeNull();
      expect(mockModel.findOne).toHaveBeenCalledWith({ email });
    });

    it('should throw an error if the database query fails', async () => {
      const email = 'test@example.com';

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect(repository.findByEmail(email)).rejects.toThrow('Database error');
    });
  });

  describe('updateLastLogin', () => {
    it('should successfully update last login', async () => {
      const userId = 'testUserId';

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      } as any);

      await repository.updateLastLogin(userId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { lastLogin: expect.any(Date) }
      );
    });

    it('should throw an error if update fails', async () => {
      const userId = 'testUserId';

      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      } as any);

      await expect(repository.updateLastLogin(userId)).rejects.toThrow('Database error');
    });
  });
});
