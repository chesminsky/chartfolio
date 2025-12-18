import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/json-transport';
import { Errors } from 'src/errors-enum';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmailService {
  constructor(private usersService: UsersService, private configService: ConfigService) {}

  async createUserByEmail(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      throw new BadRequestException({
        message: Errors.AUTH_USER_ALREADY_REGISTERED
      });
    }

    const salt = await bcrypt.genSalt();
    const hash: string = await bcrypt.hash(password, salt);

    return this.usersService.create({
      username: email.toLowerCase(),
      email: email.toLowerCase(),
      password: hash,
      verified: false
    });
  }

  async createEmailToken(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (user && this.emailSentRecently(user.updated)) {
      throw new BadRequestException({
        message: Errors.AUTH_LOGIN_SENT_RECENTLY
      });
    } else {
      await this.usersService.addEmailToken(email);
      return true;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const res = await this.usersService.confirmEmailByToken(token);
      return Boolean(res);
    } catch (err) {
      return false;
    }
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException({
        message: Errors.AUTH_USER_NOT_FOUND
      });
    }

    if (user && user.emailToken) {
      const transporter = this.makeTransporter();
      const mailOptions = this.makeVerifyEmailOptions(user.emailToken, email);
      const sent = await this.sendEmail(transporter, mailOptions);

      return sent;
    } else {
      throw new BadRequestException({ message: Errors.AUTH_USER_NOT_REGISTERED });
    }
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException({
        message: Errors.AUTH_USER_NOT_FOUND
      });
    }
    const tokenModel = await this.createForgottenPasswordToken(email);
    if (tokenModel && tokenModel.emailToken) {
      const transporter = this.makeTransporter();
      const mailOptions = this.makeResetPasswordOptions(tokenModel.emailToken, email);
      const sent = await this.sendEmail(transporter, mailOptions);
      return sent;
    } else {
      throw new BadRequestException({ message: Errors.AUTH_USER_NOT_REGISTERED });
    }
  }

  async createForgottenPasswordToken(email: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException({
        message: Errors.AUTH_USER_NOT_FOUND
      });
    }

    const tooEarly = user.updated ? this.emailSentRecently(user.updated) : false;
    if (tooEarly) {
      throw new BadRequestException({
        message: Errors.RESET_PASSWORD_EMAIL_SENT_RECENTLY
      });
    } else {
      const userWithToken = await this.usersService.addEmailToken(email);
      return userWithToken;
    }
  }

  private makeVerifyEmailOptions(emailToken: string, email: string): MailOptions {
    const verifyLink = `${this.configService.get<string>('AUTH_URL')}/email/verify/${emailToken}`;

    return {
      from: '"Chartfolio" <' + this.configService.get<string>('MAIL_USER') + '>',
      to: email,
      subject: 'Verify Email',
      text: 'Verify Email',
      html: `Hi! <br><br> Thanks for your registration<br><br>
          <a href="${verifyLink}">
            Click here to activate your account
          </a>
          `
    };
  }

  private makeResetPasswordOptions(emailToken: string, email: string): MailOptions {
    const resendLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password/${emailToken}`;

    return {
      from: '"Chartfolio" <' + this.configService.get<string>('MAIL_USER') + '>',
      to: email,
      subject: 'Forgotten Password',
      text: 'Forgot Password',
      html: `Hi! <br><br> If you requested to reset your password<br><br>
        <a href="${resendLink}">
          Click here
        </a>
        `
    };
  }

  private makeTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS')
      }
    });
  }

  private async sendEmail(transporter, mailOptions): Promise<boolean> {
    const sent = await new Promise<boolean>(async function(resolve, reject) {
      return await transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log('Message sent: %s', error);
          return reject(false);
        }
        console.log('Message sent: %s', info.messageId);
        resolve(true);
      });
    });

    return sent;
  }

  private emailSentRecently(timestamp: number): boolean {
    return (new Date().getTime() - new Date(timestamp).getTime()) / 60000 < 3;
  }
}
