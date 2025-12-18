import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { actionDeleteCategory } from '../../../core/categories/categories.actions';
import { Category } from '../../../core/categories/categories.model';
import { selectCategories } from '../../../core/categories/categories.selectors';
import { CATEGORIES_TRANSLATIONS, OPTIONS_TRANSLATIONS } from '../translations';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'anms-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'options', 'delete'];
  categories$ = this.store.select(selectCategories);
  mobileActionsRow: Category;

  readonly CATEGORIES_TRANSLATIONS = CATEGORIES_TRANSLATIONS;
  readonly OPTIONS_TRANSLATIONS = OPTIONS_TRANSLATIONS;

  constructor(private router: Router, private store: Store, private translate: TranslateService) {}

  ngOnInit(): void {}

  getOptions(c: Category): string {
    return c.options
      .map(o =>
        this.OPTIONS_TRANSLATIONS[o.code]
          ? this.translate.instant(this.OPTIONS_TRANSLATIONS[o.code])
          : o.name
      )
      .join(', ');
  }

  toNew(): void {
    this.router.navigate(['/categories/new']);
  }

  toEdit(row: Category): void {
    if (this.mobileActionsRow !== row) {
      this.router.navigate(['/categories/edit', row._id]);
    }
  }

  onSwipeLeft(e: Event, row: Category) {
    this.mobileActionsRow = row;
  }

  onSwipeRight(e: Event, row: Category) {
    this.mobileActionsRow = null;
  }

  deleteCategory(c: Category): void {
    this.store.dispatch(actionDeleteCategory({ id: c._id }));
  }
}
