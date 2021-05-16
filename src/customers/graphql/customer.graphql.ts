import { ID, Field, ObjectType } from '@nestjs/graphql';
import { Paginated } from '../../core/pagination/page-size.pagination';

@ObjectType()
export class Customer {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field((type) => Date, { nullable: true })
  created_at?: Date;
}

@ObjectType()
export class PaginatedCustomers extends Paginated(Customer) {}
