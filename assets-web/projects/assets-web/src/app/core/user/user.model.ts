import { AppState } from '../core.state';

export enum UserPlan {
  Free = 'free',
  Pro = 'pro'
}

export interface DataLimits {
  [UserPlan.Free]: number;
  [UserPlan.Pro]: number;
}

export interface UserLimits {
  assets: number;
  categories: number;
}

export interface User {
  username: string;
  password: string;
  googleId: string;
  categoryMap: any;
  settingsMap: any;
  plan: UserPlan;
  picture: string;
  limits: UserLimits;
}

export interface UserState {
  user: User;
}

export interface State extends AppState {
  user: UserState;
}
