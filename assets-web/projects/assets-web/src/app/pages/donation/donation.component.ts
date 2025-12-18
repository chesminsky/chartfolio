import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../core/core.module';
import { UserService } from '../../core/user/user.service';

@Component({
  selector: 'anms-donation',
  templateUrl: './donation.component.html',
  styleUrls: ['./donation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonationComponent {
  wallets = [
    {
      name: 'Bitcoin',
      address: 'bc1qqrn0dgz4h8meuc9rmtphu88jmpefxt6wg9avjw'
    },
    {
      name: 'Ethereum',
      address: '0xbB2e0f955388aAFd92094BdfC075c56897F51D2C'
    },
    {
      name: 'USDT (ERC20)',
      address: '0xbB2e0f955388aAFd92094BdfC075c56897F51D2C'
    },
    {
      name: 'USDT (TRC20)',
      address: 'TVqeJGEVes1tSe9qckkighgWPto2pf4drM'
    },
    {
      name: 'DOGE',
      address: 'DA6NP37f3XuiXYKzKvCGj19s2ZqFNm6rhG'
    }
  ];

  form = new UntypedFormGroup({
    wallet: new UntypedFormControl(this.wallets[0]),
    hash: new UntypedFormControl('')
  });

  sent = false;
  loading = false;

  constructor(
    public translate: TranslateService,
    public ns: NotificationService,
    private us: UserService,
    private cd: ChangeDetectorRef
  ) {}

  get wallet() {
    return this.form.get('wallet').value;
  }

  async onSubmit(): Promise<void> {

    this.loading = true;
    await this.us
      .upgradeUserPlan({
        hash: this.form.value.hash,
        currency: this.form.value.wallet.name
      })
      .toPromise();

    this.sent = true;
    this.loading = false;

    this.cd.detectChanges();
  }

  onCopy(): void {
    this.ns.default(this.translate.instant('anms.donation.copied'));
  }
}
