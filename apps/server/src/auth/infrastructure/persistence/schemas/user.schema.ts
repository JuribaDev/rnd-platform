import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    },
  },
})
export class UserDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: Date, index: true })
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);


UserSchema.index({ email: 1, lastLogin: 1 });
