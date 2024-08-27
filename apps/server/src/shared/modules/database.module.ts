import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDocument, UserSchema } from '../../auth/infrastructure/persistence/schemas/user.schema';
import { ProductDocument, ProductSchema } from '../../product/infrastructure/persistence/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: ProductDocument.name, schema: ProductSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
