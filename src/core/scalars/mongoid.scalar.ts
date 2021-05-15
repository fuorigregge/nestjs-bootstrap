import { Scalar } from '@nestjs/graphql';
import { Kind, ASTNode } from 'graphql';
import { ObjectId } from 'mongodb';

interface MongoObjectIdPlainObject {
  __bsontype: string;
  id: Buffer;
}

@Scalar('MongoObjectId', (type) => ObjectId)
export class MongoObjectId {
  description = 'Mongo object id scalar type';

  parseValue(value: string) {
    return new ObjectId(value); // value from the client
  }

  serialize(value: ObjectId) {
    return value.toHexString();
  }

  parseLiteral(ast: ASTNode) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value); // value from the client query
    }
    return null;
  }
}
