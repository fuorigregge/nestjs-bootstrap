import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { CaslAbilityFactory } from './casl/ability-factory.casl';
import { RefreshTokensService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';
import { GithubStrategy } from './strategies/github.strategy';
import { PassportController } from './passport.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    forwardRef(() => UsersModule), //circular
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GithubStrategy,
    RefreshTokensService,
    CaslAbilityFactory,
  ],

  controllers: [PassportController],
  exports: [AuthService, CaslAbilityFactory],
})
export class AuthModule {}
