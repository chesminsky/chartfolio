import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { delay, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AssetCategoryMap, CategoryMap } from '../categories/categories.model';
import { selectCategoryMap } from '../categories/categories.selectors';
import { selectIsAuthenticated } from '../core.module';
import { SettingsState } from '../settings/settings.model';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private baseUrl = 'users';

  constructor(private http: HttpClient, private store: Store) {}

  getUser(): Observable<User> {
    return this.store.select(selectIsAuthenticated).pipe(
      delay(0),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.get<User>(`${this.apiUrl}/${this.baseUrl}/me`);
        } else {
          return of(null);
        }
      })
    );
  }

  upgradeUserPlan(payment: { hash: string; currency: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${this.baseUrl}/upgrade`, payment);
  }

  updateCategoryMap(params: {
    code?: string;
    assetCategoryMap?: AssetCategoryMap;
    categoryMap?: CategoryMap;
  }): Observable<CategoryMap> {
    return combineLatest([
      this.store.select(selectIsAuthenticated).pipe(take(1)),
      this.store.select(selectCategoryMap).pipe(take(1))
    ]).pipe(
      switchMap(([isAuthenticated, categoryMap]) => {
        let cm: CategoryMap;
        if (params.code && params) {
          cm = { ...categoryMap, [params.code]: params.assetCategoryMap };
        } else if (params.categoryMap) {
          cm = { ...params.categoryMap };
        } else {
          cm = { ...categoryMap };
        }
        if (isAuthenticated) {
          return this.http.put<CategoryMap>(`${this.apiUrl}/${this.baseUrl}/categories`, cm);
        } else {
          return of(cm);
        }
      })
    );
  }

  updateSettingsMap(settingsMap?: SettingsState): Observable<SettingsState> {
    return this.store
      .select(selectIsAuthenticated)
      .pipe(take(1))
      .pipe(
        switchMap(isAuthenticated => {
          if (isAuthenticated) {
            return this.http.put<SettingsState>(`${this.apiUrl}/${this.baseUrl}/settings`, settingsMap);
          } else {
            return of(settingsMap);
          }
        })
      );
  }
}
