import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { selectIsAuthenticated } from '../auth/auth.selectors';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { Asset } from './data.model';
import { makeId } from '../../shared/utils';

export const ASSETS_KEY = 'ASSETS';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;
  private baseUrl = 'assets';

  constructor(private http: HttpClient, private lsService: LocalStorageService, private store: Store) {}

  getAssets(): Observable<Asset[]> {
    return this.store.select(selectIsAuthenticated).pipe(
      delay(0),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.get<Asset[]>(`${this.apiUrl}/${this.baseUrl}`);
        } else {
          return this.http.get<Asset[]>(`${this.apiUrl}/users/defaults/assets`).pipe(
            map(list => list.map(item => ({ ...item, _id: makeId() }))),
            map(this.compareToCached<Asset>())
          );
        }
      })
    );
  }

  updateAsset(asset: Asset): Observable<Asset> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.put<Asset>(`${this.apiUrl}/${this.baseUrl}/${asset._id}`, asset);
        } else {
          return of({ ...asset });
        }
      })
    );
  }

  deleteAssets(ids: string[]): Observable<string[]> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.post<string[]>(`${this.apiUrl}/${this.baseUrl}/delete`, ids);
        } else {
          return of(ids);
        }
      })
    );
  }

  createAsset(asset: Asset): Observable<Asset> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.post<Asset>(`${this.apiUrl}/${this.baseUrl}`, asset);
        } else {
          const _id = makeId();
          return of({ ...asset, _id });
        }
      })
    );
  }

  private compareToCached<T extends { _id?: string }>() {
    return (data: T[]) => {
      const cached = this.lsService.getItem(ASSETS_KEY)?.assets;
      if (!cached) {
        return data;
      }

      return cached;
    };
  }
}
