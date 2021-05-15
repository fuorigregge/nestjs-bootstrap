import { Document, FilterQuery, QueryOptions } from 'mongoose';

const paginateDefaultOptions = {
  page: 1,
  limit: 10,
};

export type PaginateQueryOptions = {
  select: any;
  leanWithId: boolean;
  offset: number;
  page: number;
} & QueryOptions;

type PaginationResult = {
  page: number;
  pages: number;
  size: number;
  total_items: number;
  current_items: number;
};

export type Pagination<T> = {
  items: T[];
  pagination: PaginationResult;
};

type PaginationCallback<T> = (err: any, results: T) => void;

export default function paginatePlugin(schema) {
  /**
   * @package mongoose-paginate
   * @param {Object} [query={}]
   * @param {Object} [options={}]
   * @param {Object|String} [options.select]
   * @param {Object|String} [options.sort]
   * @param {Array|Object|String} [options.populate]
   * @param {Boolean} [options.lean=false]
   * @param {Boolean} [options.leanWithId=true]
   * @param {Number} [options.offset=0] - Use offset or page to set skip position
   * @param {Number} [options.page=1]
   * @param {Number} [options.limit=10]
   * @param {Function} [callback]
   * @returns {Promise}
   */
  schema.statics.paginate = function paginate(
    query: FilterQuery<Document>,
    options: PaginateQueryOptions,
    callback: PaginationCallback<Pagination<Document>>,
  ): Promise<Pagination<Document>> {
    query = query || {};
    options = Object.assign({}, paginateDefaultOptions, options);
    const select = options.select;
    const sort = options.sort;
    const populate = options.populate;
    const lean = options.lean || false;
    const leanWithId = options.leanWithId ? options.leanWithId : true;
    const limit = options.limit ? options.limit : 10;
    let page, offset, skip, promises;
    if (options.offset) {
      offset = options.offset;
      skip = offset;
    } else if (options.page) {
      page = options.page;
      skip = (page - 1) * limit;
    } else {
      page = 1;
      offset = 0;
      skip = offset;
    }
    if (limit) {
      const docsQuery = this.find(query)
        .select(select)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(lean);
      if (populate) {
        [].concat(populate).forEach((item) => {
          docsQuery.populate(item);
        });
      }
      promises = {
        docs: docsQuery.exec(),
        count: this.countDocuments(query).exec(),
      };
      if (lean && leanWithId) {
        promises.docs = promises.docs.then((docs) => {
          docs.forEach((doc) => {
            doc.id = String(doc._id);
          });
          return docs;
        });
      }
    }
    promises = Object.keys(promises).map((x) => promises[x]);
    return Promise.all(promises).then((data: any[]) => {
      const [docs, count] = data;

      const result: any = {
        items: docs,
        pagination: {
          total_items: count,
          current_items: docs.length,
          size: limit,
        },
      };

      if (offset !== undefined) {
        result.pagination.offset = offset;
      }

      if (page !== undefined) {
        result.pagination.page = page;
        result.pagination.pages = Math.ceil(count / limit) || 1;
      }

      if (typeof callback === 'function') {
        return callback(null, result);
      }

      return result;
    });
  };
}
