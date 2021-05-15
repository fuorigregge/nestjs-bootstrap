import { User } from 'src/users/schemas/user.schema';
import { TemplateCommon } from './mail';
import { Mail } from './mail.model';

export type RegistrationPayload = {
  user: User;
} & TemplateCommon;

export class RegistrationMail extends Mail {
  constructor(
    template: string,
    payload?: RegistrationPayload,
    subject?: string,
  ) {
    super();
    this.locale = payload.user.locale;
    this.to = [payload.user.username];
    this.payload = payload;
    this.subject = subject;
    this.template = template;

    this.setDefault();
  }
}
