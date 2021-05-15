import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { RegistrationMail } from 'src/mail/models/registration.model';
import { User } from '../schemas/user.schema';
import { UsersService } from '../users.service';
import { WorkspacesService } from '../workspaces.service';

@Injectable()
export class UserCreatedListener {
  constructor(
    private readonly usersService: UsersService,
    private readonly workspacesService: WorkspacesService,
    private readonly mailService: MailService,
  ) {}

  @OnEvent('user.created', { async: true })
  async handleUserCreatedEvent(user: User) {
    const workspace = await this.workspacesService.create({
      name: `${user.first_name} ${user.last_name} workspace`,
    });

    await this.usersService.addWorkspace(user, workspace);

    await this.mailService.sendQueue(
      new RegistrationMail('Registration', { user }),
    );
  }
}
