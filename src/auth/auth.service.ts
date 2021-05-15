import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/schemas/user.schema';
import { Token } from 'src/users/graphql/users.graphql';
import { RefreshTokensService } from './refresh-token.service';
import { RefreshToken } from './schemas/refresh-token.schema';
import { JWTRefreshTokenPayload } from './strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokensService,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return await bcrypt.hash(password, salt);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByUsername(username);

    if (!user) return null;

    if (!user.auth.jwt.verified) return null;

    const match = await bcrypt.compare(password, user.auth.jwt.password);

    if (match) {
      return user;
    }

    return null;
  }

  async generateRefreshToken(user: User): Promise<string> {
    const expiresIn = this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRES_IN_SEC',
    );

    const token = await this.refreshTokenService.createRefreshToken(
      user,
      parseInt(expiresIn.replace('s', '')),
    );

    return this.jwtService.sign(
      { uid: user.id, tkid: token.id },
      {
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_TOKEN_EXPIRES_IN_SEC',
        ),
      },
    );
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload = { uid: user._id, wid: user.current_workspace_id };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN_SEC'),
    });
  }

  async login(user: User): Promise<Token> {
    return {
      token: await this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(user),
    };
  }

  async createTokenFromRefreshToken(
    refresh: string,
  ): Promise<{ token: string; user: User }> {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  private async resolveRefreshToken(
    encoded: string,
  ): Promise<{ user: User; token: RefreshToken }> {
    const payload = await this.decodeRefreshToken(encoded);

    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found');
    }

    if (token.is_revoked) {
      throw new UnprocessableEntityException('Refresh token revoked');
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return { user, token };
  }

  private async decodeRefreshToken(
    token: string,
  ): Promise<JWTRefreshTokenPayload> {
    try {
      return await this.jwtService.verify(token);
    } catch (e) {
      throw new UnprocessableEntityException(
        'Refresh token malformed or expired',
      );
    }
  }

  private async getUserFromRefreshTokenPayload(
    payload: JWTRefreshTokenPayload,
  ): Promise<User> {
    if (!payload || !payload.uid) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.usersService.findOneById(payload.uid);
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: JWTRefreshTokenPayload,
  ): Promise<RefreshToken | null> {
    const tokenId = payload.tkid;

    if (!tokenId) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return this.refreshTokenService.findTokenById(tokenId);
  }
}
