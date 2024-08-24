import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlacklistedTokenDocument } from './schemas/blacklisted-token.schema';
import { IBlackListedTokenRepository } from '../../domain/repositories/blacklisted-token-repository.interface';



@Injectable()
export class MongoBlackListedTokenRepository implements IBlackListedTokenRepository {
  constructor(
    @InjectModel(BlacklistedTokenDocument.name)
    private blacklistedTokenModel: Model<BlacklistedTokenDocument>
  ) {}


  async blacklist(token: string): Promise<void> {
    await this.blacklistedTokenModel.create({ token });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const found = await this.blacklistedTokenModel.findOne({ token }).exec();
    return !!found;
  }
}
