import { Test, TestingModule } from '@nestjs/testing';
import { BLACKLISTED_TOKEN_REPOSITORY } from '../../domain/auth.tokens';
import { UnprocessableEntityException } from '@nestjs/common';
import { LogoutUseCase } from './logout.usecase.service';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockBlacklistedTokenRepository: jest.Mocked<any>;

  beforeEach(async () => {
    mockBlacklistedTokenRepository = {
      blacklist: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: BLACKLISTED_TOKEN_REPOSITORY, useValue: mockBlacklistedTokenRepository },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should logout a user successfully', async () => {
    const token = 'validToken';
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    mockBlacklistedTokenRepository.blacklist.mockResolvedValue(undefined);

    await useCase.execute(req);

    expect(mockBlacklistedTokenRepository.blacklist).toHaveBeenCalledWith(token);
  });

  it('should throw UnprocessableEntityException if blacklisting fails', async () => {
    const token = 'validToken';
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    mockBlacklistedTokenRepository.blacklist.mockRejectedValue(new Error('Blacklisting failed'));

    await expect(useCase.execute(req)).rejects.toThrow(UnprocessableEntityException);
    expect(mockBlacklistedTokenRepository.blacklist).toHaveBeenCalledWith(token);
  });

  it('should throw an error if authorization header is missing', async () => {
    const req = {
      headers: {},
    };

    await expect(useCase.execute(req)).rejects.toThrow();
    expect(mockBlacklistedTokenRepository.blacklist).not.toHaveBeenCalled();
  });
});
