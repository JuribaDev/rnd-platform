import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '../use-cases/create-product.usecase.service';
import { UserRegisteredEvent } from '../../../auth/domain/events/user-registered.event';
import { CreateProductDto } from '../../presentation/dtos/create-product.dto';
import { faker } from '@faker-js/faker';
import { CreateFakeProductsHandler } from './user-registered-event.handler';

jest.mock('@faker-js/faker', () => ({
  faker: {
    commerce: {
      productName: jest.fn(),
      productDescription: jest.fn(),
      price: jest.fn(),
    },
  },
}));

describe('CreateFakeProductsHandler', () => {
  let handler: CreateFakeProductsHandler;
  let createProductUseCase: jest.Mocked<CreateProductUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFakeProductsHandler,
        {
          provide: CreateProductUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateFakeProductsHandler>(CreateFakeProductsHandler);
    createProductUseCase = module.get(CreateProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('handle', () => {
    it('should create 50 fake products when user.registered event is triggered', async () => {
      const event: UserRegisteredEvent = { userId: 'user123' };
      const fakeProduct: CreateProductDto = {
        name: 'Fake Product',
        description: 'Fake Description',
        price: 9.99,
      };

      (faker.commerce.productName as jest.Mock).mockReturnValue(fakeProduct.name);
      (faker.commerce.productDescription as jest.Mock).mockReturnValue(fakeProduct.description);
      (faker.commerce.price as jest.Mock).mockReturnValue(fakeProduct.price.toString());

      await handler.handle(event);

      expect(createProductUseCase.execute).toHaveBeenCalledTimes(50);
      expect(createProductUseCase.execute).toHaveBeenCalledWith(event.userId, expect.objectContaining(fakeProduct));
    });

    it('should throw an error if product creation fails', async () => {
      const event: UserRegisteredEvent = { userId: 'user123' };
      createProductUseCase.execute.mockRejectedValueOnce(new Error('Creation failed'));

      await expect(handler.handle(event)).rejects.toThrow('Creation failed');
      expect(createProductUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateFakeProduct', () => {
    it('should generate a fake product with valid properties', () => {
      const fakeProduct = {
        name: 'Fake Product',
        description: 'Fake Description',
        price: '9.99',
      };

      (faker.commerce.productName as jest.Mock).mockReturnValue(fakeProduct.name);
      (faker.commerce.productDescription as jest.Mock).mockReturnValue(fakeProduct.description);
      (faker.commerce.price as jest.Mock).mockReturnValue(fakeProduct.price);

      const result = (handler as any).generateFakeProduct();

      expect(result).toEqual({
        name: fakeProduct.name,
        description: fakeProduct.description,
        price: parseFloat(fakeProduct.price),
      });
    });
  });
});
