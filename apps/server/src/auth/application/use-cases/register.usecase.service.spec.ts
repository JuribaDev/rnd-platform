import { Test, TestingModule } from '@nestjs/testing';
import { USER_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE } from '../../domain/auth.tokens';
import { ConflictException } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { RegisterUseCase } from './register.usecase.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RegisterRequestDto } from '../../presentation/dtos/auth.dto';
import { AuthResponseDto } from '../../presentation/dtos/auth.res.dto';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let mockUserRepository: jest.Mocked<any>;
  let mockPasswordHasher: jest.Mocked<any>;
  let mockTokenService: jest.Mocked<any>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

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
    mockEventEmitter = {
      emitAsync: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should register a new user successfully', async () => {
    const registerDto: RegisterRequestDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };
    const hashedPassword = 'hashedPassword123';
    const userId = 'generatedUserId';
    const token = 'generatedToken';
    const createdAt = new Date();

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
    mockUserRepository.create.mockResolvedValue(new User(userId, registerDto.email, registerDto.name, hashedPassword, createdAt));
    mockTokenService.generate.mockReturnValue(token);

    const result = await useCase.execute(registerDto);

    expect(result).toBeInstanceOf(AuthResponseDto);
    expect(result).toEqual({
      id: userId,
      email: registerDto.email,
      name: registerDto.name,
      createdAt: createdAt,
      token: { token },
    });
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(registerDto.password);
    expect(mockUserRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    }));
    expect(mockTokenService.generate).toHaveBeenCalledWith(expect.any(User));
    expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('user.registered', expect.anything());
  });

  it('should throw ConflictException if user already exists', async () => {
    const registerDto: RegisterRequestDto = {
      email: 'existing@example.com',
      name: 'Existing User',
      password: 'password123',
    };

    mockUserRepository.findByEmail.mockResolvedValue(new User('existingId', registerDto.email, registerDto.name, 'hashedPassword', new Date()));

    await expect(useCase.execute(registerDto)).rejects.toThrow(ConflictException);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockTokenService.generate).not.toHaveBeenCalled();
    expect(mockEventEmitter.emitAsync).not.toHaveBeenCalled();
  });
});
