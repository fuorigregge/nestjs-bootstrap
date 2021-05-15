import { modelOptions, plugin } from '@typegoose/typegoose';
import * as mongoose from 'mongoose';
import paginatePlugin from '../pagination/mongo-pagination';
import { PaginateQueryOptions } from '../pagination/mongo-pagination';
import { PaginationInput } from '../pagination/pagination.input';

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
      transform(doc, ret) {
        // il problema è serializzare ObjectId di modo che diventi stringa non un oggetto bson.
        // alternativa JSON.parse(JSON.stringify(doc)) crea problemi con altre conversioni (es. date)
        // TODO supportare sub documenti
        Object.keys(ret).map((key) => {
          if (ret[key].constructor.name === 'ObjectID') {
            ret[key] = ret[key].toString();
          }
        });
        return ret;
      },
    },
  },
})
@plugin(paginatePlugin)
export abstract class Document {
  public _id: mongoose.Types.ObjectId;

  public get id(): string {
    return this._id.toString();
  }

  public __v: number;

  static paginate: (
    query: mongoose.FilterQuery<mongoose.Document>,
    options: PaginationInput | PaginateQueryOptions,
  ) => any;
}
