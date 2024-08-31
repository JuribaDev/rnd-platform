import { Controller, Get, Query, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUserProductsUseCase } from '../application/use-cases/get-user-products.usecase.service';
import { PaginatedProductResponseDto } from './dtos/products.dto';

@Controller('user')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(
    private readonly getUserProductsUseCase: GetUserProductsUseCase,
  ) {}


  @Get('products')
  @HttpCode(HttpStatus.OK)
  async getUserProducts(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<PaginatedProductResponseDto> {
    const result = await this.getUserProductsUseCase.execute(req, page, limit);
    return new PaginatedProductResponseDto(result);
  }

}
