import { Action, createReducer, on } from '@ngrx/store';
import {
	authLoginError,
	authLoginSuccess,
	authLogout,
	authRegister,
	authRegisterError,
	authRegisterSuccess
} from './auth.actions';
import { AuthState } from './auth.models';

export const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  registeredEmail: '',
  loading: false
};

const reducer = createReducer(
  initialState,
  on(authLoginSuccess, (state, action) => ({
    ...state,
    isAuthenticated: true,
    errorMessage: null,
    token: action.auth.token,
    username: action.auth.username
  })),
  on(authRegister, (state, action) => ({
    ...state,
    loading: true
  })),
  on(authRegisterSuccess, (state, action) => ({
    ...state,
    registeredEmail: action.email,
    loading: false
  })),
  on(authRegisterError, (state, action) => ({
    ...state,
    loading: false
  })),
  on(authLoginError, state => ({
    ...state,
    errorMessage: 'wrongCredentials',
    isAuthenticated: false,
    username: null
  })),
  on(authLogout, state => ({ ...state, isAuthenticated: false }))
);

export function authReducer(state: AuthState | undefined, action: Action): AuthState {
  return reducer(state, action);
}
