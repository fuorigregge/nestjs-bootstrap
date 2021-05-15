import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtControllerAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info: Error) {
    if (err || info || !user) {
      //check token expiration
      throw err || info || new UnauthorizedException();
    }

    return user;
  }
}
