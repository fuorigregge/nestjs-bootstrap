import { AnyAbility, AnyMongoAbility, ExtractSubjectType } from '@casl/ability';
import {
  AbilityQuery,
  rulesToQuery,
  RuleToQueryConverter,
} from '@casl/ability/extra';

function convertToMongoQuery(rule: AnyMongoAbility['rules'][number]) {
  const conditions = rule.conditions!;
  return rule.inverted ? { $nor: [conditions] } : conditions;
}

/**
 * @deprecated use for testing
 * @param ability
 * @param action
 * @param subjectType
 * @param convert
 */
export function _rulesToQuery<T extends AnyAbility>(
  ability: T,
  action: Parameters<T['rulesFor']>[0],
  subjectType: ExtractSubjectType<Parameters<T['rulesFor']>[1]>,
  convert: RuleToQueryConverter<T>,
): AbilityQuery | null {
  const query: AbilityQuery = {};

  const rules = ability.rulesFor(action, subjectType);

  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const op = rule.inverted ? '$and' : '$or';

    if (!rule.conditions) {
      if (rule.inverted) {
        break;
      } else {
        delete query[op];
        return query;
      }
    } else {
      query[op] = query[op] || [];
      query[op]!.push(convert(rule));
    }
  }

  return query.$or ? query : null;
}

export function toMongoQuery<T extends AnyMongoAbility>(
  ability: T,
  subjectType: Parameters<T['rulesFor']>[1],
  action?: Parameters<T['rulesFor']>[0],
) {
  return rulesToQuery(
    ability,
    action || 'read',
    subjectType,
    convertToMongoQuery,
  );
}
