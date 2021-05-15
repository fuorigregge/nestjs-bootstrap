import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppAbility } from '../ability-factory.casl';

export const UserAbility = createParamDecorator(
  (data: unknown, context: ExecutionContext): AppAbility => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.ability;
  },
);
