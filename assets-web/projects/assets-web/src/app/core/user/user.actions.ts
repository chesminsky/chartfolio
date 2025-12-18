import { createAction, props } from '@ngrx/store';
import { User } from './user.model';

export enum UserActions {
  GetUser = '[User] Get User',
  GetUserSuccess = '[User] Get User Success',
  GetUserError = '[User] Get User Error'
}

export const actionGetUser = createAction(UserActions.GetUser);
export const actionGetUserError = createAction(UserActions.GetUserError);
export const actionGetUserSuccess = createAction(UserActions.GetUserSuccess, props<{ user: User }>());
