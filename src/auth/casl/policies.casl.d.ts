import { AppAbility, Resources } from './ability-factory.casl';
import { Action } from './actions.casl';

interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export interface IPolicy {
  action: Action;
  resource: Resources;
}

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback | IPolicy;
