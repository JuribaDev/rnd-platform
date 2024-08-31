import { validate } from 'class-validator';
import { RegisterRequestDto, LoginRequestDto } from './auth.dto';

describe('Auth DTOs', () => {
  describe('RegisterRequestDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = new RegisterRequestDto();
      dto.email = 'test@example.com';
      dto.name = 'Test User';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email', async () => {
      const dto = new RegisterRequestDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with short password', async () => {
      const dto = new RegisterRequestDto();
      dto.email = 'test@example.com';
      dto.name = 'Test User';
      dto.password = 'short';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with missing fields', async () => {
      const dto = new RegisterRequestDto();

      const errors = await validate(dto);
      expect(errors.length).toBe(3);
      expect(errors.map(e => e.property)).toEqual(expect.arrayContaining(['email', 'name','password']));
    });
  });

  describe('LoginRequestDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = new LoginRequestDto();
      dto.email = 'test@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email', async () => {
      const dto = new LoginRequestDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with missing fields', async () => {
      const dto = new LoginRequestDto();

      const errors = await validate(dto);
      expect(errors.length).toBe(2);
      expect(errors.map(e => e.property)).toEqual(expect.arrayContaining(['email', 'password']));
    });

    it('should not enforce minimum length on password', async () => {
      const dto = new LoginRequestDto();
      dto.email = 'test@example.com';
      dto.password = 'short';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
