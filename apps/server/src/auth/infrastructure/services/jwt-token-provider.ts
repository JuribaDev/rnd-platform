import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenProvider } from '../../application/ports/token-provider.interface';
import { User } from '../../domain/entities/user.entity';
import * as process from 'node:process';

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  generate(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRATION || '8h' });
  }

  verify(token: string): any {
    return this.jwtService.verify(token);
  }
}
