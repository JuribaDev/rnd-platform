import { Product } from '../entities/product.entity';

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findByUser(userId: string, page: number, limit: number): Promise<{ products: Product[], total: number }>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
