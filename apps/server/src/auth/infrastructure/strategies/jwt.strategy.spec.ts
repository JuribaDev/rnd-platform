import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { BLACKLISTED_TOKEN_REPOSITORY } from '../../domain/auth.tokens';
import { ExtractJwt, Strategy } from 'passport-jwt';

jest.mock('passport-jwt');

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockBlacklistedTokenRepository: jest.Mocked<any>;

  beforeEach(async () => {
    // Mock Strategy constructor
    (Strategy as jest.Mock).mockImplementation(function() {
      this.name = 'jwt';
    });

    // Mock ExtractJwt.fromAuthHeaderAsBearerToken
    (ExtractJwt.fromAuthHeaderAsBearerToken as jest.Mock).mockReturnValue(() => 'mockedToken');

    mockBlacklistedTokenRepository = {
      isBlacklisted: jest.fn(),
    };

    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: BLACKLISTED_TOKEN_REPOSITORY,
          useValue: mockBlacklistedTokenRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should use the correct strategy configuration', () => {
    expect(Strategy).toHaveBeenCalledWith(
      {
        jwtFromRequest: expect.any(Function),
        ignoreExpiration: false,
        secretOrKey: 'test-secret',
        passReqToCallback: true,
      },
      expect.any(Function)
    );
  });

  describe('validate', () => {
    it('should return user data for valid token', async () => {
      const req = { headers: { authorization: 'Bearer validToken' } };
      const payload = { sub: '123', email: 'test@example.com' };
      mockBlacklistedTokenRepository.isBlacklisted.mockResolvedValue(false);

      const result = await strategy.validate(req, payload);

      expect(result).toEqual({ userId: '123', email: 'test@example.com' });
      expect(mockBlacklistedTokenRepository.isBlacklisted).toHaveBeenCalledWith('mockedToken');
    });

    it('should throw UnauthorizedException for blacklisted token', async () => {
      const req = { headers: { authorization: 'Bearer blacklistedToken' } };
      const payload = { sub: '123', email: 'test@example.com' };
      mockBlacklistedTokenRepository.isBlacklisted.mockResolvedValue(true);

      await expect(strategy.validate(req, payload)).rejects.toThrow(UnauthorizedException);
      expect(mockBlacklistedTokenRepository.isBlacklisted).toHaveBeenCalledWith('mockedToken');
    });
  });
});
