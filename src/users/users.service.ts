import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserInput } from './inputs/create-user.input';
import { User } from './schemas/user.schema';
import { Workspace } from './schemas/workspace.schema';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@nestjs/mongoose';
import { randomUrlSafeToken } from 'src/auth/auth.utils';
import { Profile } from 'passport-github2';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: ReturnModelType<typeof User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    const createdUser = new this.userModel({
      first_name: createUserInput.first_name,
      last_name: createUserInput.last_name,
      username: createUserInput.username,
      auth: {
        jwt: {
          password: createUserInput.password,
          verification_token: await randomUrlSafeToken(48),
        },
      },
    });

    this.eventEmitter.emit('user.created', createdUser);

    return await createdUser.save();
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userModel.findOne({ _id: id });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username: username });
  }

  /**
   * migliorare aggiungendo un periodo di validazione
   * se l'utente chiede nuovamente l'email di attivazione e clicca sulla precedente
   * il token si rinnova e il penultimo non viene trovato
   * @param token
   */
  async verifyUser(token): Promise<User | null> {
    const user = await this.userModel.findOne({
      'auth.jwt.verification_token': token,
    });

    if (!user) {
      return null;
    }

    this.userModel
      .updateOne(
        { _id: user._id },
        {
          $set: { 'auth.jwt.verified': true },
          $unset: {
            'auth.jwt.verification_token': null,
          },
        },
      )
      .exec();

    return user;
  }

  async addWorkspace(user: User, workspace: Workspace): Promise<any> {
    return await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: { current_workspace_id: workspace._id },
        $push: { workspaces_id: workspace._id },
      },
    );
  }

  async findOneByGithubId(id: string): Promise<User | undefined> {
    return this.userModel.findOne({ 'auth.github.id': id });
  }

  async connectGithubAccount(
    user: User,
    profile: Profile,
    accessToken: string,
  ): Promise<any> {
    return await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          'auth.github': { id: profile.id, access_token: accessToken },
        },
      },
    );
  }
}
