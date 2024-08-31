export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  name: string;
  password: string;
}

export interface TokenDto {
  token: string;
}

export interface AuthResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  token: TokenDto;
}
