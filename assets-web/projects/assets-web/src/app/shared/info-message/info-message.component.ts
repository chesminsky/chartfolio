import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
import { LocalStorageService } from '../../core/core.module';

@Component({
  selector: 'anms-info-message',
  templateUrl: './info-message.component.html',
  styleUrls: ['./info-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoMessageComponent {
  @Input()
  code: string;

  @Input()
  persist = false;

  @Input()
  type: 'info' | 'warn' = 'info';

  constructor(private ls: LocalStorageService) {}

  @HostBinding('hidden')
  get isHidden(): boolean {
    if (this.persist) {
      return this.ls.getItem(this.key) === 'hidden';
    } else {
      return (window as any)[this.key] === 'hidden';
    }
  }

  private get key(): string {
    return `INFO_MESSAGE_${this.code}`;
  }

  hide(): void {
    if (this.persist) {
      this.ls.setItem(this.key, 'hidden');
    } else {
      (window as any)[this.key] = 'hidden';
    }
  }
}
