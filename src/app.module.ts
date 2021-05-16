import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersModule } from './users/users.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { CoreModule } from './core/core.module';
import { accessibleRecordsPlugin } from './core/schemas/plugins/casl-mongoose';
import { CaslAbilityFactory } from './auth/casl/ability-factory.casl';
import config from './config';
import { MailModule } from './mail/mail.module';
import { I18nJsonParser, I18nModule } from 'nestjs-i18n';
import path from 'path';
import { BullModule } from '@nestjs/bull';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [    
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      connectionFactory: (connection) => {
        connection.plugin(accessibleRecordsPlugin);
        return connection;
      },
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>('I18N_LOCALE_FALLBACK'),
        parserOptions: {
          path: path.join(__dirname, '/i18n/'),
        },
      }),
      parser: I18nJsonParser,
      inject: [ConfigService],
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: false,
      autoSchemaFile: join(process.cwd(), 'src', 'schema.gql'),
      context: ({ req, connection }) =>
        connection ? { req: connection.context } : { req },
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
    }),
    CaslAbilityFactory,
    CoreModule,
    UsersModule,
    MailModule,
    CustomersModule    
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
