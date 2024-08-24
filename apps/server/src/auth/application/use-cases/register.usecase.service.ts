import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenProvider } from '../ports/token-provider.interface';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from '../../domain/auth.tokens';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenProvider
  ) {
  }

  async execute(email: string, password: string): Promise<{ token: string }> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const newUser = new User(
      '',
      email,
      hashedPassword,
      new Date(),
    );

    const createdUser = await this.userRepository.create(newUser);

    const token = this.tokenService.generate(createdUser);

    return { token };
  }

}
