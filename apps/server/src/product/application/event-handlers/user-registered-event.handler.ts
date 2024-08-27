import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { faker } from '@faker-js/faker';
import { CreateProductUseCase } from '../use-cases/create-product.usecase.service';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';

@Injectable()
export class CreateFakeProductsHandler {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @OnEvent('user.registered', { async: true })
  async handle(event: UserRegisteredEvent) {

    const products = Array(50).fill(null).map(() => this.generateFakeProduct());

    for (const product of products) {
      await this.createProductUseCase.execute(event.userId, product);
    }
  }

  private generateFakeProduct(): CreateProductDto {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
    };
  }
}
