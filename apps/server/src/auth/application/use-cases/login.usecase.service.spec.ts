import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE } from '../../domain/auth.tokens';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { LoginUseCase } from './login.usecase.service';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: jest.Mocked<any>;
  let mockPasswordHasher: jest.Mocked<any>;
  let mockTokenService: jest.Mocked<any>;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      updateLastLogin: jest.fn(),
    };
    mockPasswordHasher = {
      compare: jest.fn(),
    };
    mockTokenService = {
      generate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should login a user successfully', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';
    const userId = 'generatedUserId';
    const token = 'generatedToken';

    const user = new User(userId, email, hashedPassword, new Date());

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockTokenService.generate.mockReturnValue(token);

    const result = await useCase.execute(email, password);

    expect(result).toEqual({ token });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(userId);
    expect(mockTokenService.generate).toHaveBeenCalledWith(user);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const email = 'nonexistent@example.com';
    const password = 'password123';

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(email, password)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';
    const hashedPassword = 'hashedPassword123';
    const userId = 'generatedUserId';

    const user = new User(userId, email, hashedPassword, new Date());

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(email, password)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(password, hashedPassword);
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });
});
