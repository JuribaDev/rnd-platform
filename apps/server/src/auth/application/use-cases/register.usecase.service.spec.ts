import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE } from '../../domain/auth.tokens';
import { ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { RegisterUseCase } from './register.usecase.service';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<any>;
  let mockPasswordHasher: jest.Mocked<any>;
  let mockTokenService: jest.Mocked<any>;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    mockPasswordHasher = {
      hash: jest.fn(),
    };
    mockTokenService = {
      generate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register a new user successfully', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';
    const userId = 'generatedUserId';
    const token = 'generatedToken';

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
    mockUserRepository.create.mockResolvedValue(new User(userId, email, hashedPassword, new Date()));
    mockTokenService.generate.mockReturnValue(token);

    const result = await useCase.execute(email, password);

    expect(result).toEqual({ token });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(password);
    expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({ email, password: hashedPassword }));
    expect(mockTokenService.generate).toHaveBeenCalledWith(expect.any(User));
  });

  it('should throw ConflictException if user already exists', async () => {
    const email = 'existing@example.com';
    const password = 'password123';

    mockUserRepository.findByEmail.mockResolvedValue(new User('existingId', email, 'hashedPassword', new Date()));

    await expect(useCase.execute(email, password)).rejects.toThrow(ConflictException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });
});
