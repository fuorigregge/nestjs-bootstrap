import { MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWorkspaceInput {
  @Field()
  @Transform(({ value }) => value.trim())
  @MaxLength(50)
  name: string;
}
