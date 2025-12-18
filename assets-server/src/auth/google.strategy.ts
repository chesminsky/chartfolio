/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { config } from 'dotenv';
import { Profile, Strategy } from 'passport-google-oauth20';
import { UserToken } from './auth.models';
import { AuthService, Provider } from './auth.service';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET'),
      callbackURL: `${configService.get<string>('AUTH_URL')}/google/callback`,
      passReqToCallback: true,
      scope: ['email', 'profile']
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function
  ): Promise<void> {
    try {
      const userToken: UserToken = await this.authService.validateOAuthLogin(
        profile,
        Provider.GOOGLE
      );
      done(null, userToken);
    } catch (err) {
      done(err, false);
    }
  }
}
