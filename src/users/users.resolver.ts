import {
  forwardRef,
  Inject,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserInput } from './inputs/create-user.input';
import { Token, User } from './graphql/users.graphql';
import { Workspace } from './graphql/workspace.graphql';
import { UsersService } from './users.service';
import { WorkspacesService } from './workspaces.service';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { GithubAuthGuard } from 'src/auth/guards/github-auth.guard';

@Resolver((of) => User)
export class UsersResolver {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query((returns) => User, { name: 'me' })
  async getCurrentUser(@Context() { req }): Promise<User> {
    return req.user;
  }

  @Mutation((returns) => String, { name: 'createUser' })
  async create(@Args('user') args: CreateUserInput): Promise<string> {
    args.password = await this.authService.hashPassword(args.password);

    const createdUser = await this.usersService.create(args);

    return createdUser.id;
  }

  @Mutation((returns) => Token)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<Token> {
    const result = await this.authService.validateUser(username, password);
    if (result) {
      return await this.authService.login(result);
    }
    throw new UnauthorizedException();
  }

  @UseGuards(JwtAuthGuard, GithubAuthGuard)
  @Mutation((returns) => Boolean, { name: 'linkSocialAccount' })
  async linkSocialAccount(
    @Args('social') social: string,
    @CurrentUser() user: User,
  ) {
    return true;
  }

  @Mutation((returns) => User, { name: 'verifyUser', nullable: true })
  async verify(@Args('token') token: string) {
    return await this.usersService.verifyUser(token);
  }

  @Mutation((returns) => Token, { name: 'refreshToken' })
  async refreshToken(@Args('token') refreshToken: string) {
    const { token } = await this.authService.createTokenFromRefreshToken(
      refreshToken,
    );
    return { token };
  }

  @ResolveField('full_name')
  getFullName(@Parent() user: User): string {
    return `${user.first_name} ${user.last_name}`;
  }

  @ResolveField((returns) => Workspace, { name: 'current_workspace' })
  async getWorkspace(@Parent() user: User): Promise<Workspace> {
    return this.workspacesService.findOneById(user.current_workspace_id);
  }

  @ResolveField((returns) => [Workspace], { name: 'workspaces' })
  async getWorkspaces(@Parent() user: User) {
    return this.workspacesService.findByIds(user.workspaces_id);
  }
}
