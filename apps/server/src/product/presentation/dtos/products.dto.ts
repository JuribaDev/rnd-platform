import { Expose, Type } from 'class-transformer';
import { Product } from '../../domain/entities/product.entity';

export class ProductDto {
  constructor(product: Product) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.userId = product.userId;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  price: number;

  @Expose()
  userId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class PaginatedProductResponseDto {
  @Expose()
  @Type(() => ProductDto)
  products: ProductDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  constructor(partial: Partial<PaginatedProductResponseDto>) {
    Object.assign(this, partial);
  }
}
