import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersResolver } from './users.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { IsUserAlreadyExist } from './validators/username.validators';
import { UserCreatedListener } from './listeners/user-created.listener';
import { WorkspacesService } from './workspaces.service';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    forwardRef(() => AuthModule), //circular
    MailModule,
  ],
  providers: [
    UsersService,
    UsersResolver,
    WorkspacesService,
    IsUserAlreadyExist,
    UserCreatedListener,
  ],
  exports: [UsersService, WorkspacesService],
})
export class UsersModule {}
