import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ProductDocument } from './schemas/product.schema';

@Injectable()
export class MongoProductRepository implements IProductRepository {
  constructor(@InjectModel(ProductDocument.name) private productModel: Model<ProductDocument>) {}

  private toEntity(doc: ProductDocument): Product {
    return new Product(
      doc._id.toString(),
      doc.name,
      doc.description,
      doc.price,
      doc.userId.toString(),
      doc.createdAt,
      doc.updatedAt
    );
  }
  async create(product: Product): Promise<Product> {
    const createdProduct = await this.productModel.create(product);
    return this.toEntity(createdProduct);
  }
  async findByUser(userId: string, page: number, limit: number): Promise<{ products: Product[], total: number }> {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productModel.find({ userId }).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments({ userId })
    ]);
    return {
      products: products.map(this.toEntity),
      total
    };
  }
}
