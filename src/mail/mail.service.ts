import { Injectable } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Mail } from './models/mail.model';
import { TemplateService } from 'src/templates/template.service';
import { htmlToText } from 'html-to-text';
import { I18nService } from 'nestjs-i18n';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { MAIL_QUEUE } from './mail.constants';

@Injectable()
export class MailService {
  //i servizi sono singleton,va resettata la variabile all'invio
  //trovare un modo migliore?
  private mail: Mail;

  /**
   * se viene chiamato MailService da un evento I18nRequestScopeService non funziona perchè dipende da REQUEST
   * perciò usare I18nService
   * @param mailerService
   * @param templateService
   * @param i18n
   */
  constructor(
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
    private readonly mailerService: MailerService,
    private readonly templateService: TemplateService,
    private readonly i18n: I18nService,
  ) {}

  public async sendQueue(mail: Mail): Promise<void> {
    this.mailQueue.add({ mail });
  }

  /**
   * @param mail
   */
  public async send(mail: Mail): Promise<void> {
    const data = await this.build(mail);

    this.mailerService
      .sendMail(data)
      .then(() => {
        this.mail = null;
      })
      .catch((e) => {
        this.mail = null;
        console.log(e);
      });
  }

  private async build(mail: Mail): Promise<ISendMailOptions> {
    this.mail = mail;

    const { html, text } = await this.buildTemplates();

    const data: ISendMailOptions = {
      to: mail.to,
      subject: await this.buildSubject(mail.subject),
      text: text,
      html: html,
    };

    if (mail.from) {
      //altrimenti prendi default
      data.from = mail.from;
    }

    return data;
  }

  private async buildSubject(subject: string): Promise<string> {
    if (!subject) {
      return await this.i18n.t(`email.${this.mail.key}.subject`, {
        lang: this.mail.locale,
      });
    }
    return subject;
  }

  private async buildTemplates(): Promise<{ html: string; text: string }> {
    const html = this.templateService.render(this.mail.template, {
      ...this.mail.payload,
      t: await this.buildTranslations(),
    });

    const text = this.buildText(html);

    return { html, text };
  }

  private buildText(html: string): string {
    if (this.mail.text) return this.mail.text;
    return htmlToText(html, {
      wordwrap: 130,
    });
  }

  private async buildTranslations(): Promise<any> {
    return Promise.all([
      await this.i18n.t('email.shared', { lang: this.mail.locale }),
      await this.i18n.t(`email.${this.mail.key}`, { lang: this.mail.locale }),
    ])
      .then((data) => {
        return { ...data[0], ...data[1] };
      })
      .catch((e) => console.log('Unable to build translations', e));
  }
}
