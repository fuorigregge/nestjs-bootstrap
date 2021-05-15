import { AbilityBuilder } from '@casl/ability';
import { mongoose } from '@typegoose/typegoose';
import { User } from 'src/users/schemas/user.schema';
import { Workspace } from 'src/users/schemas/workspace.schema';
import { AppAbility } from './ability-factory.casl';
import { Action } from './actions.casl';

export enum Roles {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  MEMBER = 'member',
  GUEST = 'guest',
}

type DefinePermissions = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void;

/**
 * mappatura di tutti permessi per ruolo
 */
export const rolePermissions: Record<Roles, DefinePermissions> = {
  superadmin(user, { can }) {
    can(Action.Manage, 'all');
  },
  admin(user, { can }) {
    can(Action.Manage, User, { workspaces_id: { $in: user.workspaces_id } });    
    can(Action.Manage, Workspace, {
      _id: {
        $in: user.workspaces_id.map(
          (w) => new mongoose.Types.ObjectId(w.toString()),
        ),
      },
    });
  },
  manager(user, { can }) {
    can(Action.Manage, User, { workspaces_id: { $in: user.workspaces_id } });    
    can(Action.Manage, Workspace, {
      _id: {
        $in: user.workspaces_id.map(
          (w) => new mongoose.Types.ObjectId(w.toString()),
        ),
      },
    });
  },
  member(user, { can }) {    
    can(Action.Manage, User, { _id: user._id });
    can(Action.Read, Workspace, {
      _id: {
        $in: user.workspaces_id.map(
          (w) => new mongoose.Types.ObjectId(w.toString()),
        ),
      },
    });
  },
  guest(user, { can }) {
    can(Action.Manage, User, { _id: user._id });
  },
};
