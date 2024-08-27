import { Test, TestingModule } from '@nestjs/testing';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';
import { CreateProductUseCase } from './create-product.usecase.service';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepository = module.get(PRODUCT_REPOSITORY);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new product', async () => {
      const userId = 'user123';
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'A test product description',
        price: 19.99,
      };

      const createdProduct: Product = {
        id: 'prod123',
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        userId: userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      productRepository.create.mockResolvedValue(createdProduct);

      const result = await useCase.execute(userId, createProductDto);

      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          userId: userId,
        })
      );

      expect(result).toEqual(createdProduct);
    });

    it('should throw an error if product creation fails', async () => {
      const userId = 'user123';
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'A test product description',
        price: 19.99,
      };

      const error = new Error('Failed to create product');
      productRepository.create.mockRejectedValue(error);

      await expect(useCase.execute(userId, createProductDto)).rejects.toThrow('Failed to create product');
    });
  });
});
