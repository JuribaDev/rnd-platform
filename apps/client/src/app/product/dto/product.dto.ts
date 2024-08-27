export interface ProductDto {
  id: string;
  name: string;
  description: string;
  price: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProductResponseDto {
  products: ProductDto[];
  total: number;
  page: number;
  limit: number;
}
