import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Category } from '../core/categories/categories.model';
import { selectCategories } from '../core/categories/categories.selectors';
import { selectIsAuthenticated } from '../core/core.module';
import { selectAssets } from '../core/data/data.selectors';
import { User, UserPlan } from '../core/user/user.model';
import { selectUser } from '../core/user/user.selectors';

@Component({
  selector: 'anms-messages',
  template: `
    <anms-info-message *ngIf="checkLocalUsage$ | async" code="AUTH">
      {{ 'anms.overview.not-authenticated' | translate }}
      <br />
      <a [routerLink]="['/login']">{{ 'anms.menu.login' | translate }}</a>
    </anms-info-message>

    <anms-info-message *ngIf="exceedsLimits$ | async" code="LIMITS" type="warn">
      {{ 'anms.overview.run-out-of-limits' | translate }}
      <a [routerLink]="['/donation']">{{ 'anms.overview.upgrade' | translate }}</a>
    </anms-info-message>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {
  categories$: Observable<Array<Category>> = this.store.select(selectCategories);

  isAuthenticated$: Observable<boolean> = this.store.pipe(select(selectIsAuthenticated));
  private assets$ = this.store.pipe(select(selectAssets));
  constructor(private store: Store) {}

  get checkLocalUsage$(): Observable<boolean> {
    return combineLatest([this.assets$.pipe(map(list => list?.length)), this.isAuthenticated$]).pipe(
      map(([length, isAuth]) => length > 1 && !isAuth)
    );
  }

  get exceedsLimits$(): Observable<boolean> {
    return combineLatest([
      this.assets$.pipe(map(list => list?.length)),
      this.categories$.pipe(map(list => list?.length)),
      this.store.select(selectUser).pipe(filter(Boolean))
    ]).pipe(
      map(
        ([aLength, cLength, user]: [number, number, User]) =>
          user.plan === UserPlan.Free && (aLength >= user.limits.assets || cLength >= user.limits.categories)
      )
    );
  }
}
