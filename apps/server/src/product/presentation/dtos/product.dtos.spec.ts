import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import 'reflect-metadata';

import { CreateProductDto } from './create-product.dto';
import { Product } from '../../domain/entities/product.entity';
import { PaginatedProductResponseDto, ProductDto } from './products.dto';

describe('Product DTOs', () => {
  describe('ProductDto', () => {
    it('should create a ProductDto instance from a Product entity', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        description: 'A test product',
        price: 9.99,
        userId: 'user1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const productDto = new ProductDto(product);

      expect(productDto).toEqual(product);
      expect(productDto).toBeInstanceOf(ProductDto);
    });

    it('should expose all properties', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        description: 'A test product',
        price: 9.99,
        userId: 'user1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const productDto = new ProductDto(product);

      expect(productDto.id).toBe(product.id);
      expect(productDto.name).toBe(product.name);
      expect(productDto.description).toBe(product.description);
      expect(productDto.price).toBe(product.price);
      expect(productDto.userId).toBe(product.userId);
      expect(productDto.createdAt).toBe(product.createdAt);
      expect(productDto.updatedAt).toBe(product.updatedAt);
    });
  });

  describe('PaginatedProductResponseDto', () => {
    it('should expose all properties', () => {
      const product: Product = {
        id: '1',
        name: 'Test Product',
        description: 'A test product',
        price: 9.99,
        userId: 'user1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      const productDto = new ProductDto(product);

      const paginatedProductResponseDto = new PaginatedProductResponseDto({
        products: [productDto],
        total: 1,
        page: 1,
        limit: 10,
      });

      expect(paginatedProductResponseDto.products).toEqual([productDto]);
      expect(paginatedProductResponseDto.total).toBe(1);
      expect(paginatedProductResponseDto.page).toBe(1);
      expect(paginatedProductResponseDto.limit).toBe(10);
    });
  });


  describe('CreateProductDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'New Product',
        description: 'A new product',
        price: 29.99,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation without name', async () => {
      const dto = plainToInstance(CreateProductDto, {
        description: 'A new product',
        price: 29.99,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });
    it('should fail validation without price', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'New Product',
        description: 'A new product',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
    });


    it('should pass validation without optional description', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'New Product',
        price: 29.99,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
