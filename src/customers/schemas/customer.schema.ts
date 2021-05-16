import { buildSchema, getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { Document } from 'src/core/schemas/document.schema';
import { Workspace } from 'src/users/schemas/workspace.schema';

export class Customer extends Document {
  @prop({ required: true })
  public name: string;

  @prop({ type: Date, default: Date.now })
  public created_at: Date;

  @prop({ ref: () => Workspace })
  public workspace_id: Ref<Workspace>;
}

export const CustomerModel = getModelForClass(Customer);
export const CustomerSchema = buildSchema(Customer);
