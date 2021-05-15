import { Controller, Get, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtControllerAuthGuard } from './guards/jwt-controller-auth.guard';

@Controller('passport')
export class PassportController {
  @Get('/github')
  @UseGuards(AuthGuard('github'))
  async githubLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/github-connect')
  @UseGuards(JwtControllerAuthGuard, AuthGuard('github'))
  async githubConnect(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/github/redirect')
  @UseGuards(AuthGuard('github'))
  async githubLoginRedirect(@Req() req): Promise<any> {
    return {
      statusCode: HttpStatus.OK,
      data: req.user,
    };
  }
}
