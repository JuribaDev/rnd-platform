import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE } from '../../domain/auth.tokens';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { LoginUseCase } from './login.usecase.service';
import { LoginRequestDto } from '../../presentation/dtos/auth.dto';
import { AuthResponseDto } from '../../presentation/dtos/auth.res.dto';

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
    const loginRequest: LoginRequestDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const userId = 'generatedUserId';
    const name = 'Test User';
    const hashedPassword = 'hashedPassword123';
    const createdAt = new Date();
    const token = 'generatedToken';

    const user = new User(userId, loginRequest.email, name, hashedPassword, createdAt);

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(true);
    mockTokenService.generate.mockReturnValue(token);

    const result = await useCase.execute(loginRequest);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result).toEqual({
      id: userId,
      email: loginRequest.email,
      name: name,
      createdAt: createdAt,
      token: { token },
    });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginRequest.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginRequest.password, hashedPassword);
    expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(userId);
    expect(mockTokenService.generate).toHaveBeenCalledWith(user);
  });

  it('should throw NotFoundException if user does not exist', async () => {
    const loginRequest: LoginRequestDto = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(loginRequest)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginRequest.email);
    expect(mockPasswordHasher.compare).not.toHaveBeenCalled();
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    const loginRequest: LoginRequestDto = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };
    const userId = 'generatedUserId';
    const name = 'Test User';
    const hashedPassword = 'hashedPassword123';
    const createdAt = new Date();

    const user = new User(userId, loginRequest.email, name, hashedPassword, createdAt);

    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockPasswordHasher.compare.mockResolvedValue(false);

    await expect(useCase.execute(loginRequest)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginRequest.email);
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginRequest.password, hashedPassword);
    expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
  });
});
