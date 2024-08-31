import { Test, TestingModule } from '@nestjs/testing';
import { JwtTokenProvider } from './jwt-token-provider';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../domain/entities/user.entity';

describe('JwtTokenProvider', () => {
  let provider: JwtTokenProvider;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenProvider,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    provider = module.get<JwtTokenProvider>(JwtTokenProvider);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('generate', () => {
    it('should generate a token', () => {
      const user = new User('123', 'test@example.com','test user', 'password', new Date());
      const token = 'generatedToken';
      jwtService.sign.mockReturnValue(token);

      const result = provider.generate(user);

      expect(result).toBe(token);
      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id });
    });
  });

  describe('verify', () => {
    it('should verify a token', () => {
      const token = 'validToken';
      const payload = { email: 'test@example.com', sub: '123' };
      jwtService.verify.mockReturnValue(payload);

      const result = provider.verify(token);

      expect(result).toEqual(payload);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });
  });
});
