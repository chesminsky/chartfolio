import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import { actionDeleteAsset } from '../../../core/data/data.actions';
import { Asset } from '../../../core/data/data.model';
import { selectAssets } from '../../../core/data/data.selectors';

@Component({
  selector: 'anms-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'delete'];
  portfolios$ = this.store.select(selectAssets).pipe(map(assets => assets.filter(a => !a.parentId)));
  mobileActionsRow: Asset;

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {}

  toNew(): void {
    this.router.navigate(['/portfolios/new']);
  }

  toEdit(row: Asset): void {
    if (this.mobileActionsRow !== row) {
      this.router.navigate(['/portfolios/edit', row._id]);
    }
  }

  deletePortfolio(e: MouseEvent, asset: Asset): void {
    e.stopPropagation();
    this.store.select(selectAssets).pipe(take(1)).subscribe(assets => {
        const children = assets.filter(a => a.parentId === asset._id);
        this.store.dispatch(actionDeleteAsset({ ids: [asset._id, ...children.map(c => c._id)]}));
        this.mobileActionsRow = null;
    })
  }

  onSwipeLeft(e: Event, row: Asset) {
    this.mobileActionsRow = row;
  }

  onSwipeRight(e: Event, row: Asset) {
    this.mobileActionsRow = null;
  }
}
