import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('NODE_ENV', 'local');
        let uri: string;

        switch (nodeEnv) {
          case 'production':
            uri = configService.get<string>('PROD_MONGODB_URI')!;
            break;
            case 'development':
            uri = configService.get<string>('LOCAL_MONGODB_URI')!;
            break;
          default:
            uri = configService.get<string>('LOCAL_MONGODB_URI')!;
        }

        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    ProductModule,
  ],
})
export class AppModule {}
