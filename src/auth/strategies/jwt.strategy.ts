import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

type JWTTokenPayload = {
  uid: string;
  wid: string;
};

export type JWTRefreshTokenPayload = {
  uid: string;
  tkid: string;
};

export type JWTPayload = JWTTokenPayload & JWTRefreshTokenPayload;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('at'),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * restituisce direttamente l'utente dal db, non il payload
   * @param payload
   */
  async validate(payload: JWTPayload): Promise<User> {
    const user = await this.usersService.findOneById(payload.uid);

    if (payload.tkid) {
      //prova ad accedere con refresh token
      return null;
    }

    if(!user) return null;

    if (user.auth.jwt.disabled) {
      return null;
    }

    return user;
  }
}
