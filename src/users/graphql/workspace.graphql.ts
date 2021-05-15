import { ID, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Workspace {
  @Field((type) => ID)
  id: string;

  @Field()
  name: string;

  @Field((type) => Date)
  created_at?: Date;
}
