import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { authUrl } from 'src/config';
import { ResetPasswordDto, UserCallback, UserEmailRegister, UserReq, UserToken } from './auth.models';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { LocalAuthGuard } from './local.auth.guard';

@Controller(authUrl)
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('email/login')
  async login(@Req() req: UserReq): Promise<UserToken> {
    return this.authService.login(req.user);
  }

  @Post('email/register')
  async register(@Body() user: UserEmailRegister): Promise<void> {
    const registeredUser = await this.emailService.createUserByEmail(user.email, user.password);

    await this.emailService.createEmailToken(registeredUser.email);
    await this.emailService.sendEmailVerification(registeredUser.email);
  }

  @Get('email/resend-verification/:email')
  public async sendEmailVerification(@Param() params: { email: string }): Promise<void> {
    await this.emailService.createEmailToken(params.email);
    await this.emailService.sendEmailVerification(params.email);
  }

  @Get('email/verify/:token')
  public async verifyEmail(@Param() params: { token: string }, @Res() res: Response): Promise<void> {
    const result = await this.emailService.verifyEmail(params.token);
    return res.redirect(`${this.configService.get<string>('FRONTEND_URL')}/login?success=${result}&type=email`);
  }

  @Get('email/forgot-password/:email')
  public async sendEmailForgotPassword(@Param() params: { email: string }): Promise<void> {
    await this.emailService.sendEmailForgotPassword(params.email);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin(): void {
    // initiates the Google OAuth2 login flow
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookLogin(): void {
    // initiates the Facebook OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req: UserCallback, @Res() res: Response): void {
    this.handleCallback(req, res);
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookLoginCallback(@Req() req: UserCallback, @Res() res: Response): void {
    this.handleCallback(req, res);
  }

  @Post('email/change-password')
  public async setNewPassord(@Body() resetPassword: ResetPasswordDto): Promise<void> {
    return this.authService.setNewPassord(resetPassword);
  }

  private handleCallback(req: UserCallback, res: Response): void {
    const { token, username } = req.user;
    const feUrl = this.configService.get<string>('FRONTEND_URL');

    if (token) {
      res.redirect(`${feUrl}/login?success=true&token=${token}&username=${username}&type=oauth`);
    } else {
      res.redirect(`${feUrl}/login?success=false&type=oauth`);
    }
  }
}
