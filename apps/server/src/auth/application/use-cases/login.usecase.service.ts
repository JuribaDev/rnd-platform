import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenProvider } from '../ports/token-provider.interface';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from '../../domain/auth.tokens';
import { AuthResponseDto } from '../../presentation/dtos/auth.res.dto';
import { LoginRequestDto } from '../../presentation/dtos/auth.dto';

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

  async execute(loginRequest:LoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(loginRequest.email);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await this.passwordHasher.compare(loginRequest.password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    await this.userRepository.updateLastLogin(user.id);
    const token = this.tokenService.generate(user);
    return new AuthResponseDto(
      {
        id: user.id,
        email: user.email,
        name:user.name,
        createdAt: user.createdAt,
        token: { token: token },
      }
    );
  }

}
