import { ID, Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class Auth {
  @Field()
  verification_token: string;
}

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string;

  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field({ nullable: true })
  full_name?: string;

  @Field()
  username: string;

  @Field((type) => ID)
  current_workspace_id?: string;

  @Field((type) => [ID])
  workspaces_id?: string[];

  @Field()
  auth?: Auth;
}

@ObjectType()
export class Token {
  @Field()
  token: string;

  @Field({ nullable: true })
  refresh_token?: string;
}
