import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { Asset } from '../../core/data/data.model';

@Component({
  selector: 'anms-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutocompleteComponent {
  @Input() label: string;
  @Input() placeholder: string;
  @Input() ctrl: FormControl;
  @Input() assets: Asset[];

  checkAutocomplete(auto: MatAutocomplete): void {
    const opts = auto.options.toArray().map(o => o.value);
    const optCodes = opts.map(o => o?.code);
    setTimeout(() => {
      if (typeof this.ctrl.value === 'string') {
        if (!optCodes.includes(this.ctrl.value)) {
          this.ctrl.setValue('');
        } else {
          this.ctrl.setValue(opts.find(o => o.code === this.ctrl.value));
        }
      }
    }, 300);
  }

  displayFn(a: Asset): string {
    return a.code;
  }
}
