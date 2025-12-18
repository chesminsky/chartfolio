import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { actionGetUser, UserActions } from './user.actions';
import { User } from './user.model';
import { UserService } from './user.service';

@Injectable()
export class UserEffects {
  getUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetUser),
      mergeMap(action =>
        this.us.getUser().pipe(
          map((data: User) => ({
            type: UserActions.GetUserSuccess,
            user: data
          })),
          catchError(() => of({ type: UserActions.GetUserError }))
        )
      )
    )
  );

  constructor(private actions$: Actions, private us: UserService) {}
}
