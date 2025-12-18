import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AuthActions, authLogin, authLoginSuccess, authLogout, authRegister } from './auth.actions';
import { Auth } from './auth.models';
import { AuthService } from './auth.service';

export const AUTH_KEY = 'AUTH';

@Injectable()
export class AuthEffects {
  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authLoginSuccess),
        tap(({ auth }) => {
          this.localStorageService.setItem(AUTH_KEY, {
            isAuthenticated: true,
            token: auth.token,
            username: auth.username
          });
          this.router.navigate(['']);
        })
      ),
    { dispatch: false }
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authLogin),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((auth: Auth) => ({
            type: AuthActions.LoginSuccess,
            auth
          })),
          catchError(() => of({ type: AuthActions.LoginError }))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(authRegister),
      mergeMap(({ credentials }) =>
        this.authService.register(credentials).pipe(
          map(() => ({
            type: AuthActions.RegisterSuccess,
            email: credentials.email
          })),
          catchError(() => of({ type: AuthActions.RegisterError }))
        )
      )
    )
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(authLogout),
        tap(() => {
          this.localStorageService.removeItem(AUTH_KEY);
          setTimeout(() => {
            this.router.navigate(['/']);
          });
        })
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private localStorageService: LocalStorageService,
    private router: Router,
    private authService: AuthService
  ) {}
}
