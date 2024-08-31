import { ConfigService } from '@nestjs/config';

export const databaseConfig = (configService: ConfigService) => ({
  devUri: configService.get<string>('DEV_MONGODB_URI'),
  testUri: configService.get<string>('TEST_MONGODB_URI'),
  prodUri: configService.get<string>('PROD_MONGODB_URI'),
});
