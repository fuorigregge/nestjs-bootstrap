import { permittedFieldsOf } from '@casl/ability/extra';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Document } from 'mongoose';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppAbility } from './ability-factory.casl';
import { CHECK_POLICIES_KEY } from './decorators/check-policy.decorator';
import { IPolicy } from './policies.casl';
import { pick } from 'lodash';

/**
 * TODO controllare l'esistenza dei filtri prima del loop?
 * legge ability dalla request e le policy dal decoratore del resolver
 * filtra l'oggetto con i campi permessi dall'ability dell'utente
 * se non è definito alcun campo da filtrare lascia l'oggetto invariato
 */
@Injectable()
export class PolicyInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = this.getRequest(context);

    const ability = req.ability as AppAbility;

    const policies = this.getHandlerPolicies(context);

    return next.handle().pipe(
      map((data: any) => {

        if (Array.isArray(data)) {          
          return data.map(item => this.applyPolicy(this.toPlainObject(item), ability, policies))
        } else {          
          return this.applyPolicy(this.toPlainObject(data), ability, policies)
        }        
      }),
    );
  }

  protected applyPolicy(item: any, ability: AppAbility, policies: IPolicy[]) {
    policies.map((policy) => {
      const permittedFields = permittedFieldsOf(
        ability,
        policy.action,
        policy.resource,
        {
          fieldsFrom: (rule) => (rule.fields ? rule.fields : []),
        },
      );

      if (permittedFields && permittedFields.length > 0) {
        item = pick(item, permittedFields);
      }
    });

    return item;
  }

  protected toPlainObject(item: Document | Object) {
    if (item instanceof Document) {
      return item.toObject();
    }
    return item;
  }

  private getRequest(context: ExecutionContext) {
    return GqlExecutionContext.create(context).getContext().req;
  }

  protected getHandlerPolicies(context: ExecutionContext): IPolicy[] {
    return (
      this.reflector.get<IPolicy[]>(CHECK_POLICIES_KEY, context.getHandler()) ||
      []
    );
  }
}
