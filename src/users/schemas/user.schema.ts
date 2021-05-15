import { buildSchema, getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Workspace } from './workspace.schema';
import { Document } from 'src/core/schemas/document.schema';
import { Roles } from 'src/auth/casl/roles.casl';

class JWTStrategy {
  @prop()
  public password: string;

  @prop({ default: 0 })
  public attempts: number;

  @prop()
  public lock_until: Date;

  @prop()
  public last_login: Date;

  @prop({ default: false })
  public verified: boolean;

  @prop({ default: false })
  public disabled: boolean;

  @prop()
  public verification_token: string;

  @prop()
  public reset_password_token: string;
}

class GithubStrategy {
  @prop()
  public id: number;

  @prop()
  public access_token: string;
}

class AuthStrategy {
  @prop({ _id: false })
  public jwt: JWTStrategy;

  @prop({ _id: false })
  public github: GithubStrategy;
}

export class User extends Document {
  @prop()
  public first_name: string;

  @prop()
  public last_name: string;

  @prop()
  public username: string;

  @prop({ ref: () => Workspace })
  public workspaces_id: Ref<Workspace>[];

  @prop({ ref: () => Workspace })
  public current_workspace_id: Ref<Workspace>;

  @prop({ _id: false })
  public auth: AuthStrategy;

  @prop({
    type: () => String,
    default: Roles.MEMBER,
    enum: Roles,
  })
  public role: string;

  @prop({ default: 'it' })
  locale: string;

  @prop({ type: Date, default: Date.now })
  public created_at: Date;
}

export const UserModel = getModelForClass(User);
export const UserSchema = buildSchema(User);
