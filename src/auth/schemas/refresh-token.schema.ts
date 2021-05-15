import { buildSchema, getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Document } from 'src/core/schemas/document.schema';
import { User } from 'src/users/schemas/user.schema';

export class RefreshToken extends Document {
  @prop()
  is_revoked: boolean;

  @prop()
  expires_at: Date;

  @prop({ ref: () => User })
  public user_id: Ref<User>;

  @prop({ type: Date, default: Date.now })
  public created_at: Date;
}

export const RefreshTokenModel = getModelForClass(RefreshToken);
export const RefreshTokenSchema = buildSchema(RefreshToken);
