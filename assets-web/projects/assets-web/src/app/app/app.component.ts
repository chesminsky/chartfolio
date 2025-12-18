import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { environment as env } from '../../environments/environment';

import { Router } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { map } from 'rxjs/operators';
import { selectUsername } from '../core/auth/auth.selectors';
import { actionGetCategories, actionGetCategoriesMap } from '../core/categories/categories.actions';
import {
  authLogout,
  LocalStorageService,
  routeAnimations,
  selectEffectiveTheme,
  selectIsAuthenticated,
  selectSettingsLanguage,
  selectSettingsStickyHeader
} from '../core/core.module';
import { actionGetAssets, actionGetCurrencyList } from '../core/data/data.actions';
import {
  actionGetSettingsMap,
  actionSettingsChangeCurrency,
  actionSettingsChangeLanguage
} from '../core/settings/settings.actions';
import { selectSettingsCurrency, selectSettingsPreferredCurrencies } from '../core/settings/settings.selectors';
import { actionGetUser } from '../core/user/user.actions';
import { UserPlan } from '../core/user/user.model';
import { selectUser } from '../core/user/user.selectors';

const VERSION_KEY = 'VERSION';

@Component({
  selector: 'anms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  year = new Date().getFullYear();
  languages = ['en', 'ru', 'cn'];
  currencies$ = this.store.pipe(select(selectSettingsPreferredCurrencies));
  navigation = [
    { link: 'overview', label: marker('anms.menu.overview') },
    { link: 'dividends', label: marker('anms.menu.dividends') },
    { link: 'portfolios', label: marker('anms.menu.portfolios') },
    { link: 'categories', label: marker('anms.menu.categories') }
  ];
  navigationSideMenu = [...this.navigation, { link: 'settings', label: marker('anms.menu.settings') }];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;
  language$: Observable<string>;
  currency$: Observable<string>;
  theme$: Observable<string>;
  username$ = this.store.select(selectUsername);
  user$ = this.store.select(selectUser);
  userplan$ = this.user$.pipe(map(u => u?.plan));

  constructor(private store: Store, private storageService: LocalStorageService, private router: Router) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && window.matchMedia('(display-mode: standalone)').matches) {
        location.reload();
      }
    });
  }

  ngOnInit(): void {
    this.storageService.testLocalStorage();

    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.language$ = this.store.pipe(select(selectSettingsLanguage));
    this.currency$ = this.store.pipe(select(selectSettingsCurrency));
    this.theme$ = this.store.pipe(select(selectEffectiveTheme));

    this.load();

    const localVersion = this.storageService.getItem(VERSION_KEY);
    if (!localVersion) {
      localStorage.clear();
    } else {
      const parsedLocalVersion = localVersion.split('.');
      const parsedVersion = this.version.split('.');

      if (parsedVersion[0] !== parsedLocalVersion[0] || parsedVersion[1] !== parsedLocalVersion[1]) {
        localStorage.clear();
      }
    }

    this.storageService.setItem(VERSION_KEY, this.version);
  }

  onPlanClick(plan: UserPlan): void {
    if (plan === UserPlan.Free) {
      this.router.navigate(['donation']);
    }
  }

  onLoginClick() {
    this.router.navigate(['login']);
  }

  onLogoutClick() {
    this.store.dispatch(authLogout());
  }

  onLanguageSelect({ value: language }) {
    this.store.dispatch(actionSettingsChangeLanguage({ language }));
  }

  onCurrencySelect({ value: currency }) {
    this.store.dispatch(actionSettingsChangeCurrency({ currency }));
  }

  private load() {
    this.store.dispatch(actionGetUser());
    this.store.dispatch(actionGetCategories());
    this.store.dispatch(actionGetAssets());
    this.store.dispatch(actionGetCategoriesMap());
    this.store.dispatch(actionGetCurrencyList());
    this.store.dispatch(actionGetSettingsMap());
  }
}
