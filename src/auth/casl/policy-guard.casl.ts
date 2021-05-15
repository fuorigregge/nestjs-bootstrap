import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppAbility, CaslAbilityFactory } from './ability-factory.casl';
import { CHECK_POLICIES_KEY } from './decorators/check-policy.decorator';
import { PolicyHandler } from './policies.casl';
import { IPolicy } from './policies.casl';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    const request = GqlExecutionContext.create(context).getContext().req;

    const { user } = request;
    const ability = this.caslAbilityFactory.createForUser(user);

    //attach compiled ability to request to use inside resolver
    request.ability = ability;

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private isObjectPolicy(handler: PolicyHandler): handler is IPolicy {
    return (handler as IPolicy).action !== undefined;
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (this.isObjectPolicy(handler)) {
      return ability.can(handler.action, handler.resource);
    } else if (typeof handler === 'function') {
      return handler(ability);
    }

    return handler.handle(ability);
  }
}
