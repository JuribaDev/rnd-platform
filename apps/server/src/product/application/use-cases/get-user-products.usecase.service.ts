import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IProductRepository, PRODUCT_REPOSITORY } from '../../domain/repositories/product-repository.interface';
import { PaginatedProductResponseDto, ProductDto } from '../../presentation/dtos/products.dto';
import { TOKEN_SERVICE, USER_REPOSITORY } from '../../../auth/domain/auth.tokens';
import { IUserRepository } from '../../../auth/domain/repositories/user-repository.interface';
import { ITokenProvider } from '../../../auth/application/ports/token-provider.interface';

@Injectable()
export class GetUserProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenProvider,
  ) {}

  async execute(req, page: number, limit: number): Promise<PaginatedProductResponseDto> {
    const accessToken = req.headers.authorization.split(' ')[1];
    const decodedToken = this.tokenService.verify(accessToken);

    if (!decodedToken || !decodedToken.sub) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.userRepository.findById(decodedToken.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { products, total } = await this.productRepository.findByUser(user.id, page, limit);
    return new PaginatedProductResponseDto({
      products: products.map(product => new ProductDto(product)),
      total,
      page,
      limit
    });
  }
}
