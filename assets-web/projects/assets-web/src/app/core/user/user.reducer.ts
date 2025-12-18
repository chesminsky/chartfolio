import { Action, createReducer, on } from '@ngrx/store';
import { actionGetUserSuccess } from './user.actions';
import { UserState } from './user.model';

export const initialState: UserState = {
  user: null
};

const reducer = createReducer(
  initialState,
  on(actionGetUserSuccess, (state, action) => ({
    ...state,
    user: action.user
  }))
);

export function userReducer(state: UserState | undefined, action: Action) {
  return reducer(state, action);
}
