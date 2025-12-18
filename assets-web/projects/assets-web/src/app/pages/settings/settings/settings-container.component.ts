import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ROUTE_ANIMATIONS_ELEMENTS } from '../../../core/core.module';

import { map, startWith, switchMap } from 'rxjs/operators';
import { Currency } from '../../../core/currency/currency.model';
import { selectCurrencies } from '../../../core/data/data.selectors';
import {
  actionSettingsChangeAutoNightMode,
  actionSettingsChangeLanguage,
  actionSettingsChangePreferredCurrencies,
  actionSettingsChangeTheme
} from '../../../core/settings/settings.actions';
import { SettingsState, State } from '../../../core/settings/settings.model';
import { selectSettings, selectSettingsPreferredCurrencies } from '../../../core/settings/settings.selectors';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'anms-settings',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  @ViewChild('currencyInput')
  currencyInput: ElementRef<HTMLInputElement>;

  @ViewChild('auto')
  matAutocomplete: MatAutocomplete;

  routeAnimationsElements = ROUTE_ANIMATIONS_ELEMENTS;
  settings$: Observable<SettingsState>;

  themes = [
    { value: 'DEFAULT-THEME', label: marker('anms.settings.themes.blue') },
    { value: 'LIGHT-THEME', label: marker('anms.settings.themes.light') },
    { value: 'NATURE-THEME', label: marker('anms.settings.themes.nature') },
    { value: 'BLACK-THEME', label: marker('anms.settings.themes.dark') }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'cn', label: '中文' }
  ];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  currencyCtrl = new UntypedFormControl();
  filteredCurrencies: Observable<Currency[]>;
  currencies$: Observable<string[]> = this.store.select(selectSettingsPreferredCurrencies);
  allCurrencies$: Observable<Currency[]> = this.store.select(selectCurrencies);

  constructor(private store: Store<State>) {
    this.filteredCurrencies = this.allCurrencies$.pipe(
      switchMap(all =>
        this.currencyCtrl.valueChanges.pipe(
          startWith(null),
          map((term: string | null) => (term ? this.filterCurrencies(term, all) : all.slice()))
        )
      )
    );
  }

  ngOnInit() {
    this.settings$ = this.store.pipe(select(selectSettings));
  }

  onLanguageSelect({ value: language }) {
    this.store.dispatch(actionSettingsChangeLanguage({ language }));
  }

  onThemeSelect({ value: theme }) {
    this.store.dispatch(actionSettingsChangeTheme({ theme }));
  }

  onAutoNightModeToggle({ checked: autoNightMode }) {
    this.store.dispatch(actionSettingsChangeAutoNightMode({ autoNightMode }));
  }

  addCurrency(event: MatChipInputEvent, all: Currency[], selected: string[]): void {
    const currencies = [...selected];
    const input = event.input;
    const value = event.value.trim().toUpperCase();
    const codes = all.map(c => c.code);

    // Add our currency
    if (codes.includes(value) && !currencies.includes(value)) {
      currencies.push(value);
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }

    this.currencyCtrl.setValue(null);
    this.store.dispatch(actionSettingsChangePreferredCurrencies({ currencies }));
  }

  removeCurrency(currency: string, selected: string[]): void {
    const currencies = [...selected];
    const index = currencies.indexOf(currency);

    if (index >= 0) {
      currencies.splice(index, 1);
    }

    this.store.dispatch(actionSettingsChangePreferredCurrencies({ currencies }));
  }

  currencySelected(event: MatAutocompleteSelectedEvent, selected: string[]): void {
    const currencies = [...selected];
    currencies.push(event.option.value);
    this.currencyInput.nativeElement.value = '';
    this.currencyCtrl.setValue(null);
    this.store.dispatch(actionSettingsChangePreferredCurrencies({ currencies }));
  }

  private filterCurrencies(value: string, all: Currency[]): Currency[] {
    const filterValue = value.toLowerCase();

    return all.filter(
      currency => currency.code.toLowerCase().includes(filterValue) || currency.name.toLowerCase().includes(filterValue)
    );
  }
}
