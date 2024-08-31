import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { ITokenProvider } from '../ports/token-provider.interface';
import { PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from '../../domain/auth.tokens';
import { AuthResponseDto } from '../../presentation/dtos/auth.res.dto';
import { RegisterRequestDto } from '../../presentation/dtos/auth.dto';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenProvider,
    private eventEmitter: EventEmitter2
  ) {
  }

  async execute(registerDto: RegisterRequestDto): Promise<AuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.passwordHasher.hash(registerDto.password);

    const newUser = new User(
      '',
      registerDto.email.trim().toLowerCase(),
      registerDto.name,
      hashedPassword,
      new Date(),
    );

    const createdUser = await this.userRepository.create(newUser);

    await  this.eventEmitter.emitAsync('user.registered', new UserRegisteredEvent(createdUser.id));
    const token = this.tokenService.generate(createdUser);

    return new AuthResponseDto({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      createdAt: createdUser.createdAt,
      token: { token: token },
    });
  }

}
