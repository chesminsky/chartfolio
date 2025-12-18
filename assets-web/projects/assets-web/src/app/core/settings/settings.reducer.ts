import { Action, createReducer, on } from '@ngrx/store';
import { actionGetSettingsMapSuccess, actionUpdateSettingsMapSuccess } from './settings.actions';
import { NIGHT_MODE_THEME, SettingsState } from './settings.model';

const userLang = navigator.language;
const supported = ['en', 'ru', 'cn'];
const language = supported.includes(userLang) ? userLang : 'en';

export const initialState: SettingsState = {
  language,
  currency: 'USD',
  currencies: ['USD', 'EUR', 'RUB'],
  theme: 'DEFAULT-THEME',
  autoNightMode: false,
  nightTheme: NIGHT_MODE_THEME,
  stickyHeader: true,
  pageAnimations: true,
  pageAnimationsDisabled: false,
  elementsAnimations: true,
  hour: 0
};

const reducer = createReducer(
  initialState,
  on(actionGetSettingsMapSuccess, actionUpdateSettingsMapSuccess, (state, action) => ({
    ...state,
    ...action.settingsMap
  })),
  on((state, { pageAnimationsDisabled }) => ({
    ...state,
    pageAnimationsDisabled,
    pageAnimations: false
  }))
);

export function settingsReducer(state: SettingsState | undefined, action: Action) {
  return reducer(state, action);
}
