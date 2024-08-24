import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '../../application/use-cases/register.usecase.service';
import { LoginUseCase } from '../../application/use-cases/login.usecase.service';
import { LogoutUseCase } from '../../application/use-cases/logout.usecase.service';
import { RegisterRequestDto, LoginRequestDto } from '../dtos/auth.dto';
import { ConflictException, UnauthorizedException, HttpStatus } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockRegisterUseCase: jest.Mocked<RegisterUseCase>;
  let mockLoginUseCase: jest.Mocked<LoginUseCase>;
  let mockLogoutUseCase: jest.Mocked<LogoutUseCase>;

  beforeEach(async () => {
    mockRegisterUseCase = {
      execute: jest.fn(),
    } as any;
    mockLoginUseCase = {
      execute: jest.fn(),
    } as any;
    mockLogoutUseCase = {
      execute: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: LogoutUseCase, useValue: mockLogoutUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { token: 'someToken' };

      mockRegisterUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith(registerDto.email, registerDto.password);
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockRegisterUseCase.execute.mockRejectedValue(new ConflictException('User already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = { token: 'someToken' };

      mockLoginUseCase.execute.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(loginDto.email, loginDto.password);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginRequestDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockLoginUseCase.execute.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const req = {
        headers: {
          authorization: 'Bearer someToken',
        },
      };

      mockLogoutUseCase.execute.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(mockLogoutUseCase.execute).toHaveBeenCalledWith(req);
    });

    it('should throw an error if logout fails', async () => {
      const req = {
        headers: {
          authorization: 'Bearer someToken',
        },
      };

      mockLogoutUseCase.execute.mockRejectedValue(new Error('Logout failed'));

      await expect(controller.logout(req)).rejects.toThrow('Logout failed');
    });
  });
});
