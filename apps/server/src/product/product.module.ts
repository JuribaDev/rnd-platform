import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY } from './domain/repositories/product-repository.interface';
import { MongoProductRepository } from './infrastructure/persistence/mongo-product.repository';
import { ProductController } from './presentation/product.controller';
import { GetUserProductsUseCase } from './application/use-cases/get-user-products.usecase.service';
import { DatabaseModule } from '../shared/modules/database.module';
import { AuthModule } from '../auth/auth.module';
import { CreateFakeProductsHandler } from './application/event-handlers/user-registered-event.handler';
import { CreateProductUseCase } from './application/use-cases/create-product.usecase.service';

@Module({
  imports: [
   DatabaseModule,
    AuthModule,
  ],
  providers: [
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MongoProductRepository,
    },
    GetUserProductsUseCase,
    CreateProductUseCase,
    CreateFakeProductsHandler,
  ],
  controllers: [ProductController],
})
export class ProductModule {}
