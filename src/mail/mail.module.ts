import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { TemplateModule } from 'src/templates/template.module';
import path from 'path';
import { BullModule } from '@nestjs/bull';
import { MAIL_QUEUE } from './mail.constants';
import { MailProcessor } from './mail.processor';
/**
 * config with class alternative
 * https://github.com/nest-modules/mailer/issues/267
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          transport: configService.get<string>('MAIL_TRANSPORT'),
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
    TemplateModule.register({
      templateDir: path.join(
        process.env.PWD,
        'dist',
        'templates',
        'views',
        'mail',
      ),
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
