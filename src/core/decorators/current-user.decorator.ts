import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JWTPayload } from 'src/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): JWTPayload => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
