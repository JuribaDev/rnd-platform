import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { GetUserProductsUseCase } from '../application/use-cases/get-user-products.usecase.service';
import { AuthGuard } from '@nestjs/passport';
import { PaginatedProductResponseDto, ProductDto } from './dtos/products.dto';

describe('ProductController', () => {
  let controller: ProductController;
  let getUserProductsUseCase: jest.Mocked<GetUserProductsUseCase>;

  beforeEach(async () => {
    const mockGetUserProductsUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: GetUserProductsUseCase,
          useValue: mockGetUserProductsUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    getUserProductsUseCase = module.get(GetUserProductsUseCase);
  });

  describe('getUserProducts', () => {
    it('should return paginated products for the user', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const mockResult = {
        products: [
          new ProductDto({ id: 'prod1', name: 'Product 1', description: 'Description 1', price: 10, userId: 'user123', createdAt: new Date(), updatedAt: new Date() }),
          new ProductDto({ id: 'prod2', name: 'Product 2', description: 'Description 2', price: 20, userId: 'user123', createdAt: new Date(), updatedAt: new Date() }),
        ],
        total: 2,
        page: 1,
        limit: 10
      };

      getUserProductsUseCase.execute.mockResolvedValue(mockResult);

      const result = await controller.getUserProducts(mockRequest, 1, 10);

      expect(result).toBeInstanceOf(PaginatedProductResponseDto);
      expect(result.products).toEqual(mockResult.products);
      expect(result.total).toBe(mockResult.total);
      expect(result.page).toBe(mockResult.page);
      expect(result.limit).toBe(mockResult.limit);
      expect(getUserProductsUseCase.execute).toHaveBeenCalledWith(mockRequest, 1, 10);
    });

    it('should use default pagination values if not provided', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const mockResult = { products: [], total: 0, page: 1, limit: 10 };

      getUserProductsUseCase.execute.mockResolvedValue(mockResult);

      await controller.getUserProducts(mockRequest);

      expect(getUserProductsUseCase.execute).toHaveBeenCalledWith(mockRequest, 1, 10);
    });

    it('should handle custom pagination values', async () => {
      const mockRequest = { user: { id: 'user123' } };
      const mockResult = { products: [], total: 0, page: 2, limit: 20 };

      getUserProductsUseCase.execute.mockResolvedValue(mockResult);

      await controller.getUserProducts(mockRequest, 2, 20);

      expect(getUserProductsUseCase.execute).toHaveBeenCalledWith(mockRequest, 2, 20);
    });
  });
});
