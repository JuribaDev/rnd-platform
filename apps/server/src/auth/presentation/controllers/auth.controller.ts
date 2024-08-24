
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RegisterUseCase } from '../../application/use-cases/register.usecase.service';
import { LoginUseCase } from '../../application/use-cases/login.usecase.service';
import { RegisterRequestDto, LoginRequestDto } from '../dtos/auth.dto';
import { LogoutUseCase } from '../../application/use-cases/logout.usecase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCases: LoginUseCase,
    private readonly registerUseCases: RegisterUseCase,
    private readonly logoutUseCases: LogoutUseCase
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterRequestDto) {
    return await this.registerUseCases.execute(registerDto.email, registerDto.password);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginRequestDto) {
    return await this.loginUseCases.execute(loginDto.email, loginDto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  async logout(@Request() req) {
    await this.logoutUseCases.execute(req);
    return { message: 'Logged out successfully' };
  }
}
