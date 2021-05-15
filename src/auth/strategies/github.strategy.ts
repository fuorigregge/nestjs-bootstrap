import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { get } from 'lodash';
import { AuthService } from '../auth.service';

/**
 * collega un account github ad un utente già loggato
 * nel controller viene chiamato prima JwtControllerAuthGuard che setta l'utente nella richiesta
 * L'ID dell'utente viene passato al provider (github) tramite il parametro state e restituito in req.query.state
 * nella funzione validate
 */
@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
      passReqToCallback: true,
    });
  }

  authenticate(req: any, options?: Record<string, any>): void {
    const userId = get(req, 'user.id');
    super.authenticate(
      req,
      Object.assign(options, {
        scope: ['user:email'],
        state: userId,
      }),
    );
  }

  async validate(
    req: any,
    githubAccessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<any> {
    //passato da github nella callback
    const internalUserId = req.query.state;

    const { id, displayName, username, emails } = profile;

    const email = get(emails, '0.value');

    let internalUser = null;

    let accessToken = null;

    if (internalUserId) {
      //passato per associarlo all'account
      internalUser = await this.usersService.findOneById(internalUserId);
      //update profile with data github authtoken
      if (internalUser) {
        this.usersService.connectGithubAccount(
          internalUser,
          profile,
          githubAccessToken,
        );
      }
    } else {
      //passato dal client per il login
      //genera JWT interno
      internalUser = await this.usersService.findOneByGithubId(id);

      if (internalUser) {
        accessToken = await this.authService.login(internalUser);
      }
    }

    if (!internalUser) return null;

    const user = {
      id: id,
      displayName: displayName,
      username: username,
      email: email,
    };

    return {
      user,
      accessToken,
    };
  }
}
