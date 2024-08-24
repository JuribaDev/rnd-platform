import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'blackListedTokens'
})
export class BlacklistedTokenDocument extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Date, expires: '8h', default: Date.now })
  createdAt: Date;
}

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedTokenDocument);
