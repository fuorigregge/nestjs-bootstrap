import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field({ defaultValue: 1 })
  page: number;

  @Field({ defaultValue: 10 })
  limit: number;
}
