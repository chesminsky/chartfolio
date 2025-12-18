/* eslint-disable */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { UserToken } from './auth.models';
import { AuthService, Provider } from './auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID'),
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET'),
      callbackURL: `${configService.get<string>('AUTH_URL')}/facebook/callback`,
      scope: 'email',
      profileFields: ['id', 'name', 'displayName', 'emails', 'photos']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void
  ): Promise<void> {
    try {
      const userToken: UserToken = await this.authService.validateOAuthLogin(
        profile,
        Provider.FACEBOOK
      );
      done(null, userToken);
    } catch (err) {
      done(err, false);
    }
  }
}
