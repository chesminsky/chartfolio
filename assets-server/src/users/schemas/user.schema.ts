import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserLimits, UserPlan } from 'src/shared/models';

export type UserDocument = User & Document;
@Schema()
export class User {
  @Prop({ required: true })
  username: string;
  @Prop({ trim: true, select: false })
  password: string;
  @Prop()
  googleId: string;
  @Prop()
  facebookId: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop()
  categoryMap: string;
  @Prop()
  settingsMap: string;
  @Prop({ required: true, default: UserPlan.Free })
  plan: UserPlan;
  @Prop()
  picture: string;
  @Prop({ required: true, default: false })
  verified: boolean;
  @Prop()
  emailToken: string;
  @Prop()
  updated: number;

  limits: UserLimits;
}

export const UserSchema = SchemaFactory.createForClass(User);
