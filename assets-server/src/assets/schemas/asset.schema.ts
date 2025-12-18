import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type AssetDocument = Asset & Document;

@Schema()
export class Asset {
  @Prop()
  name: string;
  @Prop()
  parentId: string | null;
  @Prop()
  value: number;
  @Prop()
  price: number;
  @Prop()
  currency: string;
  @Prop()
  code: string;
  @Prop()
  searchCode: string; // code for price search
  @Prop()
  type: 'Fiat' | 'Stocks' | 'Crypto';
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
