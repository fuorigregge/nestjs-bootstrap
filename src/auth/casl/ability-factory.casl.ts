import { Injectable } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Action } from './actions.casl';
import { Workspace } from 'src/users/schemas/workspace.schema';
import { rolePermissions } from './roles.casl';
import { Customer } from 'src/customers/schemas/customer.schema';

export type Resources =
  | InferSubjects<      
      | typeof User      
      | typeof Workspace
      | typeof Customer
    >
  | 'all';

export type AppAbility = Ability<[Action, Resources]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const builder = new AbilityBuilder<Ability<[Action, Resources]>>(
      Ability as AbilityClass<AppAbility>,
    );

    if (typeof rolePermissions[user.role] === 'function') {
      rolePermissions[user.role](user, builder);
    } else {
      throw new Error(`Trying to use unknown role "${user.role}"`);
    }

    return builder.build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Resources>,
    });
  }
}
