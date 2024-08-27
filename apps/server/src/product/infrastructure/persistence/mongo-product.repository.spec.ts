import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { Product } from '../../domain/entities/product.entity';
import { MongoProductRepository } from './mongo-product.repository';

describe('MongoProductRepository', () => {
  let repository: MongoProductRepository;
  let productModel: Model<ProductDocument>;

  const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'A test product',
    price: 9.99,
    userId: '123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoProductRepository,
        {
          provide: getModelToken(ProductDocument.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MongoProductRepository>(MongoProductRepository);
    productModel = module.get<Model<ProductDocument>>(getModelToken(ProductDocument.name));
  });

  describe('create', () => {
    it('should create a new product', async () => {
      jest.spyOn(productModel, 'create').mockResolvedValue(mockProduct as any);

      const product = new Product(
        '',
        mockProduct.name,
        mockProduct.description,
        mockProduct.price,
        mockProduct.userId,
        mockProduct.createdAt,
        mockProduct.updatedAt
      );

      const result = await repository.create(product);

      expect(productModel.create).toHaveBeenCalledWith(product);
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe(mockProduct._id);
    });
  });

  describe('findByUser', () => {
    it('should find products by user and return paginated results', async () => {
      const mockProducts = [mockProduct, { ...mockProduct, _id: '2' }];
      const mockTotal = 10;

      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProducts),
      };

      jest.spyOn(productModel, 'find').mockReturnValue(mockQuery as any);
      jest.spyOn(productModel, 'countDocuments').mockResolvedValue(mockTotal);

      const result = await repository.findByUser('123', 1, 2);

      expect(productModel.find).toHaveBeenCalledWith({ userId: '123' });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(2);
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(productModel.countDocuments).toHaveBeenCalledWith({ userId: '123' });
      expect(result.products).toHaveLength(2);
      expect(result.products[0]).toBeInstanceOf(Product);
      expect(result.total).toBe(mockTotal);
    });
  });
});
