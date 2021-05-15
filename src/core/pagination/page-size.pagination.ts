import { Field, ObjectType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

@ObjectType({ isAbstract: true })
abstract class Pagination {
  @Field()
  page: number;
  @Field()
  pages: number;
  @Field()
  current_items: number;
  @Field()
  total_items: number;
  @Field()
  size: number;
}

export function Paginated<T>(classRef: Type<T>): any {
  @ObjectType(`${classRef.name}`)
  abstract class PaginatedType {
    @Field((type) => [classRef], { nullable: true })
    items?: T[];

    @Field((type) => Pagination)
    pagination: Pagination;
  }

  return PaginatedType;
}
