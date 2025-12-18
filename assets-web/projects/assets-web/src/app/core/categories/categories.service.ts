import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { Observable, of } from 'rxjs';
import { delay, filter, map, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { selectIsAuthenticated } from '../auth/auth.selectors';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { User } from '../user/user.model';
import { selectUser } from '../user/user.selectors';
import { Category, CategoryMap } from './categories.model';
import { makeId } from '../../shared/utils';

export const CATEGORIES_KEY = 'CATEGORIES';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;
  private baseUrl = 'categories';

  constructor(private http: HttpClient, private lsService: LocalStorageService, private store: Store) {}

  getCategories(): Observable<Category[]> {
    return this.store.select(selectIsAuthenticated).pipe(
      delay(0),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.get<Category[]>(`${this.apiUrl}/${this.baseUrl}`);
        } else {
          return this.http.get<Category[]>(`${this.apiUrl}/users/defaults/categories`).pipe(
            map(list => list.map(item => ({ ...item, _id: makeId() }))),
            map(this.compareToCached<Category[]>('categories'))
          );
        }
      })
    );
  }

  getCategoryMap(): Observable<CategoryMap> {
    return this.store.select(selectIsAuthenticated).pipe(
      delay(0),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.store.select(selectUser).pipe(
            filter(Boolean),
            map((user: User) => user.categoryMap)
          );
        } else {
          return of({}).pipe(map(this.compareToCached<CategoryMap>('categoryMap')));
        }
      })
    );
  }

  updateCategory(category: Category): Observable<Category> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        const cat = cloneDeep(category);
        cat.options.forEach(o => {
          if (!o.code) {
            o.code = makeId();
          }
        });
        if (isAuthenticated) {
          return this.http.put<Category>(`${this.apiUrl}/${this.baseUrl}/${category._id}`, cat);
        } else {
          return of(cat);
        }
      })
    );
  }

  deleteCategories(id: string): Observable<string> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        if (isAuthenticated) {
          return this.http.delete<string>(`${this.apiUrl}/${this.baseUrl}/${id}`);
        } else {
          return of(id);
        }
      })
    );
  }

  createCategory(category: Category): Observable<Category> {
    return this.store.select(selectIsAuthenticated).pipe(
      take(1),
      switchMap(isAuthenticated => {
        const cat = cloneDeep(category);
        cat.options.forEach(o => (o.code = makeId()));
        if (isAuthenticated) {
          return this.http.post<Category>(`${this.apiUrl}/${this.baseUrl}`, cat);
        } else {
          return of({ ...cat, _id: makeId() });
        }
      })
    );
  }

  private compareToCached<T>(key: string) {
    return (data: T) => {
      const store = this.lsService.getItem(CATEGORIES_KEY);
      const cached = store ? store[key] : null;
      if (!cached) {
        return data;
      }

      return cached;
    };
  }
}
