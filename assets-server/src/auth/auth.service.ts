import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as FacebookProfile from 'passport-facebook';
import * as GoogleProfile from 'passport-google-oauth20';
import { Errors } from 'src/errors-enum';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto, UserPayload, UserToken } from './auth.models';

export enum Provider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateOAuthLogin(
    profile: GoogleProfile.Profile | FacebookProfile.Profile,
    provider: Provider
  ): Promise<UserToken> {
    try {
      let user: User = await this.usersService.findByEmail(profile.emails[0].value);

      if (!user) {
        user = await this.usersService.registerOAuthUser(profile, provider);
      } else {
        user = await this.usersService.updateOAuthUser(user['_id'], profile, provider);
      }

      const payload: UserPayload = {
        username: user.username,
        sub: user['_id']
      };

      return {
        username: user.username,
        token: this.jwtService.sign(payload)
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: Errors.AUTH_ERROR
      });
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        message: Errors.AUTH_INVALID_CREDENTIALS
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      if (!user.verified) {
        throw new UnauthorizedException({
          message: Errors.AUTH_USER_NOT_VERIFIED
        });
      }
      return user;
    } else {
      throw new UnauthorizedException({
        message: Errors.AUTH_INVALID_CREDENTIALS
      });
    }
  }

  async login(user: User): Promise<UserToken> {
    const payload: UserPayload = { username: user.username, sub: user['_id'] };
    return {
      username: user.username,
      token: this.jwtService.sign(payload)
    };
  }

  async setNewPassord(resetPassword: ResetPasswordDto): Promise<void> {
    if (resetPassword.email && resetPassword.currentPassword) {
      const isValidPassword = await this.validateUser(resetPassword.email, resetPassword.currentPassword);
      if (isValidPassword) {
        await this.usersService.setPassword(resetPassword.email, resetPassword.newPassword);
      } else {
        throw new UnauthorizedException({
          message: Errors.AUTH_WRONG_CURRENT_PASSWORD
        });
      }
    } else if (resetPassword.newPasswordToken) {
      const forgottenPasswordModel = await this.usersService.getByToken(resetPassword.newPasswordToken);
      if (!forgottenPasswordModel) {
        throw new NotFoundException({
          message: Errors.AUTH_WRONG_EMAIL_TOKEN
        });
      }
      await this.usersService.setPassword(forgottenPasswordModel.email, resetPassword.newPassword);
    } else {
      throw new InternalServerErrorException({
        message: Errors.AUTH_CHANGE_PASSWORD_ERROR
      });
    }
  }
}
