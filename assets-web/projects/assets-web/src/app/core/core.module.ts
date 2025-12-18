import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../../environments/environment';

import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { AnimationsService } from './animations/animations.service';
import { ROUTE_ANIMATIONS_ELEMENTS, routeAnimations } from './animations/route.animations';
import { AuthGuardService } from './auth/auth-guard.service';
import { authLogin, authLogout } from './auth/auth.actions';
import { AuthEffects } from './auth/auth.effects';
import { selectAuth, selectIsAuthenticated } from './auth/auth.selectors';
import { CategoriesEffects } from './categories/categories.effects';
import { AppState, metaReducers, reducers, selectRouterState } from './core.state';
import { AssetsEffects } from './data/data.effects';
import { AppErrorHandler } from './error-handler/app-error-handler.service';
import { GoogleAnalyticsEffects } from './google-analytics/google-analytics.effects';
import { HttpErrorInterceptor } from './http-interceptors/http-error.interceptor';
import { TokenInterceptor } from './http-interceptors/token.interceptor';
import { LocalStorageService } from './local-storage/local-storage.service';
import { NotificationService } from './notifications/notification.service';
import { CustomSerializer } from './router/custom-serializer';
import { SettingsEffects } from './settings/settings.effects';
import {
  selectEffectiveTheme,
  selectSettingsLanguage,
  selectSettingsStickyHeader
} from './settings/settings.selectors';
import { TitleService } from './title/title.service';
import { UserEffects } from './user/user.effects';

export {
  AnimationsService,
  AppState,
  AuthGuardService,
  LocalStorageService,
  NotificationService,
  ROUTE_ANIMATIONS_ELEMENTS,
  TitleService,
  authLogin,
  authLogout,
  routeAnimations,
  selectAuth,
  selectEffectiveTheme,
  selectIsAuthenticated,
  selectRouterState,
  selectSettingsLanguage,
  selectSettingsStickyHeader
};

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `${environment.i18nPrefix}/assets/i18n/`, '.json');
}

@NgModule({
  imports: [
    // angular
    CommonModule,
    HttpClientModule,
    FormsModule,

    // material
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonModule,

    // ngrx
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot([
      AuthEffects,
      SettingsEffects,
      GoogleAnalyticsEffects,
      AssetsEffects,
      CategoriesEffects,
      UserEffects
    ]),
    environment.production
      ? []
      : StoreDevtoolsModule.instrument({
          name: 'Chartfolio'
        }),

    // 3rd party
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: AppErrorHandler },
    { provide: RouterStateSerializer, useClass: CustomSerializer },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: class HammerConfig extends HammerGestureConfig {
        overrides = {
          swipe: { direction: Hammer.DIRECTION_HORIZONTAL },
          pinch: { enable: false },
          rotate: { enable: false },
          pan: { enable: false }
        };
      }
    }
  ],
  exports: [
    // angular
    FormsModule,

    // material
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatButtonModule,

    // 3rd party
    TranslateModule,
    HammerModule
  ]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
