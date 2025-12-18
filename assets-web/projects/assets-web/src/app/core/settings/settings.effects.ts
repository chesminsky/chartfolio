import { OverlayContainer } from '@angular/cdk/overlay';
import { Injectable, NgZone } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { merge, of } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { selectIsAuthenticated } from '../core.module';

import { selectSettingsState } from '../core.state';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { TitleService } from '../title/title.service';
import { User } from '../user/user.model';
import { selectUser } from '../user/user.selectors';
import { UserService } from '../user/user.service';

import {
  actionGetSettingsMap,
  actionGetSettingsMapSuccess,
  actionSettingsChangeAutoNightMode,
  actionSettingsChangeCurrency,
  actionSettingsChangeHour,
  actionSettingsChangeLanguage,
  actionSettingsChangePreferredCurrencies,
  actionSettingsChangeTheme,
  actionUpdateSettingsMapSuccess,
  SettingsActions
} from './settings.actions';
import { State } from './settings.model';
import { selectEffectiveTheme, selectSettingsLanguage } from './settings.selectors';

export const SETTINGS_KEY = 'SETTINGS';

const INIT = of('anms-init-effect-trigger');

@Injectable()
export class SettingsEffects {
  hour = 0;

  changeHour$ = this.ngZone.runOutsideAngular(() =>
    setInterval(() => {
      const hour = new Date().getHours();
      if (hour !== this.hour) {
        this.hour = hour;
        this.ngZone.run(() => this.store.dispatch(actionSettingsChangeHour({ hour })));
      }
    }, 60_000)
  );

  updateTheme$ = createEffect(
    () =>
      merge(INIT, this.actions$.pipe(ofType(actionSettingsChangeTheme))).pipe(
        withLatestFrom(this.store.pipe(select(selectEffectiveTheme))),
        tap(([action, effectiveTheme]) => {
          const classList = this.overlayContainer.getContainerElement().classList;
          const toRemove = Array.from(classList).filter((item: string) => item.includes('-theme'));
          if (toRemove.length) {
            classList.remove(...toRemove);
          }
          classList.add(effectiveTheme);
        })
      ),
    { dispatch: false }
  );

  setTranslateServiceLanguage$ = createEffect(
    () =>
      this.store.pipe(
        select(selectSettingsLanguage),
        distinctUntilChanged(),
        tap(language => this.translateService.use(language))
      ),
    { dispatch: false }
  );

  setTitle$ = createEffect(
    () =>
      merge(
        this.actions$.pipe(ofType(actionSettingsChangeLanguage)),
        this.router.events.pipe(filter(event => event instanceof ActivationEnd))
      ).pipe(
        tap(() => {
          this.titleService.setTitle(this.router.routerState.snapshot.root, this.translateService);
        })
      ),
    { dispatch: false }
  );

  getSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetSettingsMap),
      mergeMap(() =>
        this.store.select(selectUser).pipe(
          filter(Boolean),
          map((user: User) => ({
            type: SettingsActions.GetSettingsMapSuccess,
            settingsMap: user.settingsMap
          })),
          catchError(() => of({ type: SettingsActions.GetSettingsMapError }))
        )
      )
    )
  );

  updateSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          actionSettingsChangeAutoNightMode,
          actionSettingsChangeLanguage,
          actionSettingsChangeCurrency,
          actionSettingsChangeTheme,
          actionSettingsChangePreferredCurrencies
        ),
        withLatestFrom(this.store.pipe(select(selectSettingsState))),
        mergeMap(([action, settings]) => this.us.updateSettingsMap({
          ...settings,
          ...action
        }).pipe(
          map((settingsState) => ({
            type: SettingsActions.UpdateSettingsMapSuccess,
            settingsMap: settingsState
          })),
          catchError(() => of({ type: SettingsActions.UpdateSettingsMapError }))
        ))
      )
  );

  persistSettings$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          actionGetSettingsMapSuccess,
          actionUpdateSettingsMapSuccess
        ),
        withLatestFrom(this.store.pipe(select(selectSettingsState))),
        tap(([action, settings]) => this.localStorageService.setItem(SETTINGS_KEY, settings))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store<State>,
    private router: Router,
    private overlayContainer: OverlayContainer,
    private localStorageService: LocalStorageService,
    private titleService: TitleService,
    private translateService: TranslateService,
    private ngZone: NgZone,
    private us: UserService,
  ) {}
}
