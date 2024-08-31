import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(@InjectModel(UserDocument.name) private userModel: Model<UserDocument>) {}

  private toEntity(doc: UserDocument): User {
    return new User(
      doc._id.toString(),
      doc.email,
      doc.name,
      doc.password,
      doc.createdAt,
      doc.lastLogin
    );
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.userModel.create(user);
    return this.toEntity(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toEntity(user) : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLogin: new Date() }).exec();
  }
}
