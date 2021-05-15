import { IsEmail, MaxLength, MinLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsUserAlreadyExist } from '../validators/username.validators';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  first_name: string;

  @Field()
  last_name: string;

  @Field()
  @Transform(({ value }) => {
    return value.trim();
  })
  @MinLength(5)
  @MaxLength(50)
  password: string;

  @Field()
  @Transform(({ value }) => value.trim())
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  username: string;
}
