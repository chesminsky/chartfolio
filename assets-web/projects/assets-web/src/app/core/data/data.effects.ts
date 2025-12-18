import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { selectAssetsState } from '../core.state';
import { CryptoService } from '../crypto/crypto.service';
import { Currency } from '../currency/currency.model';
import { CurrencyService } from '../currency/currency.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { NotificationService } from '../notifications/notification.service';
import {
  actionDeleteAsset, actionDeleteAssetSuccess, actionGetAssets, actionGetAssetsSuccess, actionGetCurrencyList, actionUpdateAsset,
  actionUpdateAssetSuccess, AssetsActions
} from './data.actions';
import { Asset } from './data.model';
import { ASSETS_KEY, DataService } from './data.service';

@Injectable()
export class AssetsEffects {
  getAssets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetAssets),
      mergeMap(action =>
        this.ds.getAssets().pipe(
          map((data: Asset[]) => ({
            type: AssetsActions.GetAssetsSuccess,
            assets: data
          })),
          catchError(() => of({ type: AssetsActions.GetAssetsError }))
        )
      )
    )
  );

  deleteAsset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionDeleteAsset),
      mergeMap(action =>
        this.ds.deleteAssets(action.ids).pipe(
          map((ids: string[]) => ({
            type: AssetsActions.DeleteAssetSuccess,
            ids,
            navigateUrl: action.navigateUrl
          })),
          catchError(() => of({ type: AssetsActions.DeleteAssetError }))
        )
      )
    )
  );

  deleteAssetSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actionDeleteAssetSuccess),
        tap(action => {
          this.ns.success(this.ts.instant('anms.notification.asset-deleted'));
          
          if (action.navigateUrl) {
            this.router.navigate([action.navigateUrl]);
          }
        })
      ),
    { dispatch: false }
  );

  updateAsset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionUpdateAsset),
      mergeMap(action => {
        if (action.parent) {
          console.log('data effects: create parent first');
          return this.ds.createAsset(action.parent).pipe(
            tap((parent: Asset) => {
              setTimeout(() => {
                this.store.dispatch(
                  actionUpdateAsset({
                    asset: { ...action.asset, parentId: parent._id }
                  })
                );
              });
            }),
            map((parent: Asset) => ({
              type: AssetsActions.UpdateAssetSuccess,
              asset: parent,
              notify: action.notify
            })),
            catchError(() => of({ type: AssetsActions.UpdateAssetError }))
          );
        }

        const method = action.asset._id ? 'updateAsset' : 'createAsset';

        console.log('data effects: ' + method, action.asset.name);

        return this.ds[method](action.asset).pipe(
          map((asset: Asset) => ({
            type: AssetsActions.UpdateAssetSuccess,
            asset,
            method,
            notify: action.notify
          })),
          catchError(() => of({ type: AssetsActions.UpdateAssetError }))
        );
      })
    )
  );

  updateAssetSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actionUpdateAssetSuccess),
        tap(action => {
          if (action.notify !== false) {
            if (action.method === 'createAsset') {
              this.ns.success(`${this.ts.instant('anms.notification.asset-created')} ${action.asset.name}`);
            }
            if (action.method === 'updateAsset') {
              this.ns.success(`${this.ts.instant('anms.notification.asset-edited')} ${action.asset.name}`);
            }

            const parentId = action.asset.parentId;

            if (parentId) {
              this.router.navigate(['/portfolios/edit', parentId]);
            } else {
              this.router.navigate(['/portfolios']);
            }
          }
        })
      ),
    { dispatch: false }
  );

  persistSettings = createEffect(
    () =>
      this.actions$.pipe(
        ofType(actionGetAssetsSuccess, actionUpdateAssetSuccess, actionDeleteAsset),
        withLatestFrom(this.store.pipe(select(selectAssetsState))),
        tap(([action, state]) => this.localStorageService.setItem(ASSETS_KEY, state))
      ),
    { dispatch: false }
  );



  // -------- currency --------
  getCurrencyList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actionGetCurrencyList),
      mergeMap(action =>
        this.cs.getList().pipe(
          map((currencyList: Currency[]) => ({
            type: AssetsActions.GetCurrencyListSuccess,
            currencyList
          })),
          catchError(() => of({ type: AssetsActions.GetCurrencyListError }))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ds: DataService,
    private store: Store,
    private localStorageService: LocalStorageService,
    private ns: NotificationService,
    private crypto: CryptoService,
    private cs: CurrencyService,
    private router: Router,
    private ts: TranslateService
  ) {}
}
