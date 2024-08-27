import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';



@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository
  ) {}

  async execute(
    userId: string,
    createProductDto: CreateProductDto
  ): Promise<Product> {
    const newProduct = new Product(
      '',
      createProductDto.name,
      createProductDto.description,
      createProductDto.price,
      userId,
      new Date(),
      new Date()
    );
    return await this.productRepository.create(newProduct);
  }
}
