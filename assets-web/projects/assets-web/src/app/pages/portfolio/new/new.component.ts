import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { actionUpdateAsset } from '../../../core/data/data.actions';
import { Asset } from '../../../core/data/data.model';
import { selectAssetsLoading } from '../../../core/data/data.selectors';

@Component({
  selector: 'anms-new',
  templateUrl: './new.component.html',
  styleUrls: ['./new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewComponent implements OnInit {
  form = new UntypedFormGroup({
    name: new UntypedFormControl('', Validators.required)
  });

  loading$ = this.store.select(selectAssetsLoading);

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {}

  back(): void {
    this.router.navigate(['/portfolios']);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const portfolio: Asset = this.form.value;
    this.store.dispatch(actionUpdateAsset({ asset: { ...portfolio, parentId: null } }));
  }
}
