import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MongoUserRepository } from './infrastructure/persistence/mongo-user-repository';
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtTokenProvider } from './infrastructure/services/jwt-token-provider';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { RegisterUseCase } from './application/use-cases/register.usecase.service';
import { LoginUseCase } from './application/use-cases/login.usecase.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { BLACKLISTED_TOKEN_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE, USER_REPOSITORY } from './domain/auth.tokens';
import {
  BlacklistedTokenDocument,
  BlacklistedTokenSchema
} from './infrastructure/persistence/schemas/blacklisted-token.schema';
import { MongoBlackListedTokenRepository } from './infrastructure/persistence/mongo-blacklisted-token-repository';
import { LogoutUseCase } from './application/use-cases/logout.usecase.service';
import * as process from 'node:process';
import { DatabaseModule } from '../shared/modules/database.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: BlacklistedTokenDocument.name, schema: BlacklistedTokenSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenProvider,
    },
    {
      provide: BLACKLISTED_TOKEN_REPOSITORY,
      useClass: MongoBlackListedTokenRepository,
    },
    JwtStrategy,
  ],
  exports: [USER_REPOSITORY, TOKEN_SERVICE],
})
export class AuthModule {}
