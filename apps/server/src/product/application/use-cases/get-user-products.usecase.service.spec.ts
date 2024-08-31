import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { PRODUCT_REPOSITORY, IProductRepository } from '../../domain/repositories/product-repository.interface';
import { PaginatedProductResponseDto, ProductDto } from '../../presentation/dtos/products.dto';
import { Product } from '../../domain/entities/product.entity';
import { User } from '../../../auth/domain/entities/user.entity';
import { GetUserProductsUseCase } from './get-user-products.usecase.service';
import { IUserRepository } from '../../../auth/domain/repositories/user-repository.interface';
import { ITokenProvider } from '../../../auth/application/ports/token-provider.interface';
import { TOKEN_SERVICE, USER_REPOSITORY } from '../../../auth/domain/auth.tokens';

describe('GetUserProductsUseCase', () => {
  let useCase: GetUserProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenProvider>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProductsUseCase,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: {
            findByUser: jest.fn(),
          },
        },
        {
          provide: USER_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TOKEN_SERVICE,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetUserProductsUseCase>(GetUserProductsUseCase);
    productRepository = module.get(PRODUCT_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
    tokenService = module.get(TOKEN_SERVICE);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockUser: User = { id: 'user123', email: 'test@example.com',name:"juriba", password: 'hashedPassword', createdAt: new Date() };
    const mockProducts: Product[] = [
      { id: 'prod1', name: 'Product 1', description: 'Description 1', price: 10, userId: 'user123', createdAt: new Date(), updatedAt: new Date() },
      { id: 'prod2', name: 'Product 2', description: 'Description 2', price: 20, userId: 'user123', createdAt: new Date(), updatedAt: new Date() },
    ];

    it('should return paginated products for a valid user', async () => {
      const mockReq = { headers: { authorization: 'Bearer validToken' } };
      const page = 1;
      const limit = 10;

      tokenService.verify.mockReturnValue({ sub: 'user123' });
      userRepository.findById.mockResolvedValue(mockUser);
      productRepository.findByUser.mockResolvedValue({ products: mockProducts, total: 2 });

      const result = await useCase.execute(mockReq, page, limit);

      expect(result).toBeInstanceOf(PaginatedProductResponseDto);
      expect(result.products).toHaveLength(2);
      expect(result.products[0]).toBeInstanceOf(ProductDto);
      expect(result.total).toBe(2);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);

      expect(tokenService.verify).toHaveBeenCalledWith('validToken');
      expect(userRepository.findById).toHaveBeenCalledWith('user123');
      expect(productRepository.findByUser).toHaveBeenCalledWith('user123', page, limit);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const mockReq = { headers: { authorization: 'Bearer invalidToken' } };
      tokenService.verify.mockReturnValue(null);

      await expect(useCase.execute(mockReq, 1, 10)).rejects.toThrow(UnauthorizedException);
      expect(tokenService.verify).toHaveBeenCalledWith('invalidToken');
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const mockReq = { headers: { authorization: 'Bearer validToken' } };
      tokenService.verify.mockReturnValue({ sub: 'nonExistentUser' });
      userRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(mockReq, 1, 10)).rejects.toThrow(UnauthorizedException);
      expect(tokenService.verify).toHaveBeenCalledWith('validToken');
      expect(userRepository.findById).toHaveBeenCalledWith('nonExistentUser');
    });

    it('should handle case when user has no products', async () => {
      const mockReq = { headers: { authorization: 'Bearer validToken' } };
      const page = 1;
      const limit = 10;

      tokenService.verify.mockReturnValue({ sub: 'user123' });
      userRepository.findById.mockResolvedValue(mockUser);
      productRepository.findByUser.mockResolvedValue({ products: [], total: 0 });

      const result = await useCase.execute(mockReq, page, limit);

      expect(result).toBeInstanceOf(PaginatedProductResponseDto);
      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.page).toBe(page);
      expect(result.limit).toBe(limit);
    });
  });
});
