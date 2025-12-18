import { createAction, props } from '@ngrx/store';
import { Credentials, Auth } from './auth.models';

export enum AuthActions {
  Logout = '[Auth] Logout',
  Login = '[Auth] Login',
  LoginSuccess = '[Auth] Login Success',
  LoginError = '[Auth] Login Error',
  Register = '[Auth] Register',
  RegisterSuccess = '[Auth] Register Success',
  RegisterError = '[Auth] Register Error'
}

export const authLogout = createAction(AuthActions.Logout);

export const authLogin = createAction(AuthActions.Login, props<{ credentials: Credentials }>());
export const authLoginSuccess = createAction(AuthActions.LoginSuccess, props<{ auth: Auth }>());
export const authLoginError = createAction(AuthActions.LoginError);

export const authRegister = createAction(AuthActions.Register, props<{ credentials: Credentials }>());
export const authRegisterSuccess = createAction(AuthActions.RegisterSuccess, props<{ email: string }>());
export const authRegisterError = createAction(AuthActions.RegisterError);
