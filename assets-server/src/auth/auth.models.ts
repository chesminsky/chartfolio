import { Request } from 'express';
import { User } from 'src/users/schemas/user.schema';

export interface UserToken {
  username: string;
  token: string;
}

export interface UserInfo {
  userId: string;
  username: string;
}

export interface UserPayload {
  sub: string;
  username: string;
}

export interface UserRequest extends Request {
  user: UserInfo;
}

export interface UserReq extends Request {
  user: User;
}

export interface UserCallback extends Request {
  user: {
    username: string;
    token: string;
  };
}

export interface UserEmailRegister {
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  email: string;
  newPassword: string;
  newPasswordToken?: string;
  currentPassword?: string;
}
