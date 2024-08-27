import { Type, Expose } from 'class-transformer';

export class TokenDto {
  @Expose()
  token: string;

  constructor(token: string) {
    this.token = token;
  }
}

export class AuthResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;
  @Expose()
  name: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => TokenDto)
  token: TokenDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}

