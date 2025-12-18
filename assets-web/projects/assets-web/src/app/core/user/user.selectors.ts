import { createSelector } from '@ngrx/store';
import { selectUserState } from '../core.state';
import { UserState } from './user.model';

export const selectUser = createSelector(selectUserState, (state: UserState) => state.user);
