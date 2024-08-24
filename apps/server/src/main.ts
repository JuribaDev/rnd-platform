import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import mongoose from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  mongoose.connection.on('connected', () => {
    Logger.log(
      `🚀 Connected to MongoDB`
    );
  });
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`Running in ${process.env.NODE_ENV} mode`);

}

bootstrap();
