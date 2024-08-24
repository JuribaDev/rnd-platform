import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenProvider } from '../ports/token-provider.interface';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from '../../domain/auth.tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenProvider
  ) {
  }

  async execute(email: string, password: string): Promise<{ token: string } | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await this.passwordHasher.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepository.updateLastLogin(user.id);
    const token = this.tokenService.generate(user);
    return { token };
  }

}
