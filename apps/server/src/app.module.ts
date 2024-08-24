import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');
        let uri: string;

        switch (nodeEnv) {
          case 'production':
            uri = configService.get<string>('PROD_MONGODB_URI')!;
            break;
          default:
            uri = configService.get<string>('DEV_MONGODB_URI')!;
        }

        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
})
export class AppModule {}
