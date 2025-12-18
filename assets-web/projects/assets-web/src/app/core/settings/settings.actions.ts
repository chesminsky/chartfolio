import { createAction, props } from '@ngrx/store';

import { Language, SettingsState } from './settings.model';

export enum SettingsActions {
  GetSettingsMap = '[Settings] Get SettingsMap',
  GetSettingsMapSuccess = '[Settings] Get SettingsMap Success',
  GetSettingsMapError = '[Settings] Get SettingsMap Error',

  UpdateSettingsMap = '[Settings] Update SettingsMap',
  UpdateSettingsMapSuccess = '[Settings] Update SettingsMap Success',
  UpdateSettingsMapError = '[Settings] Update SettingsMap Error',

  ChangeLanguage = '[Settings] Change Language',
  ChangeCurrency = '[Settings] Change Currency',
  ChangePreferredCurrency = '[Settings] Change Preferred Currencies',
  ChangeTheme = '[Settings] Change Theme',
  ChangeAutoNightMode = '[Settings] Change Auto Night Mode',
  ChangeHours = '[Settings] Change Hours'
}

export const actionGetSettingsMap = createAction(SettingsActions.GetSettingsMap);
export const actionGetSettingsMapError = createAction(SettingsActions.GetSettingsMapError);
export const actionGetSettingsMapSuccess = createAction(
  SettingsActions.GetSettingsMapSuccess,
  props<{ settingsMap: SettingsState }>()
);

export const actionUpdateSettingsMap = createAction(SettingsActions.UpdateSettingsMap);
export const actionUpdateSettingsMapError = createAction(SettingsActions.UpdateSettingsMapError);
export const actionUpdateSettingsMapSuccess = createAction(
  SettingsActions.UpdateSettingsMapSuccess,
  props<{ settingsMap: SettingsState }>()
);

export const actionSettingsChangeLanguage = createAction(
  SettingsActions.ChangeLanguage,
  props<{ language: Language }>()
);

export const actionSettingsChangeCurrency = createAction(SettingsActions.ChangeCurrency, props<{ currency: string }>());

export const actionSettingsChangePreferredCurrencies = createAction(
  SettingsActions.ChangePreferredCurrency,
  props<{ currencies: string[] }>()
);

export const actionSettingsChangeTheme = createAction(SettingsActions.ChangeTheme, props<{ theme: string }>());

export const actionSettingsChangeAutoNightMode = createAction(
  SettingsActions.ChangeAutoNightMode,
  props<{ autoNightMode: boolean }>()
);

export const actionSettingsChangeHour = createAction(SettingsActions.ChangeHours, props<{ hour: number }>());
