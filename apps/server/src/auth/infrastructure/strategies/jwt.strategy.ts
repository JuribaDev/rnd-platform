import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { BLACKLISTED_TOKEN_REPOSITORY } from '../../domain/auth.tokens';
import { IBlackListedTokenRepository } from '../../domain/repositories/blacklisted-token-repository.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
  constructor(
    @Inject(BLACKLISTED_TOKEN_REPOSITORY)
    private tokenBlacklistService: IBlackListedTokenRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (await this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token has been invalidated');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
