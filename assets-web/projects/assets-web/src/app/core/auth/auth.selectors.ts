import { createSelector } from '@ngrx/store';

import { selectAuthState } from '../core.state';
import { AuthState } from './auth.models';

export const selectAuth = createSelector(
  selectAuthState,
  (state: AuthState) => state
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectUsername = createSelector(
  selectAuthState,
  (state: AuthState) => state.username
);

export const selectRegisteredEmail = createSelector(
  selectAuthState,
  (state: AuthState) => state.registeredEmail
);


export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);