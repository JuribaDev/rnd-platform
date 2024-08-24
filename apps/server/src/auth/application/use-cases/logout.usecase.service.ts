import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { BLACKLISTED_TOKEN_REPOSITORY, } from '../../domain/auth.tokens';
import { IBlackListedTokenRepository } from '../../domain/repositories/blacklisted-token-repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(BLACKLISTED_TOKEN_REPOSITORY)
    private readonly tokenBlacklistService: IBlackListedTokenRepository)
  {}

  async execute(req:any): Promise<void> {
    const token = req.headers.authorization.split(' ')[1];
    try {
    await this.tokenBlacklistService.blacklist(token);
    } catch (e) {
      throw new UnprocessableEntityException('Error logging out');
    }
  }

}
