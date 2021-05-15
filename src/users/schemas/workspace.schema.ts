import { buildSchema, getModelForClass, prop } from '@typegoose/typegoose';
import { Document } from 'src/core/schemas/document.schema';

export class Workspace extends Document {
  @prop()
  public name: string;

  @prop({ type: Date, default: Date.now })
  public created_at: Date;
}

export const WorkspaceModel = getModelForClass(Workspace);
export const WorkspaceSchema = buildSchema(Workspace);
