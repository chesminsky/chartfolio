import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { authRegister } from '../../core/auth/auth.actions';
import { selectAuthLoading } from '../../core/auth/auth.selectors';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/core.module';


@Component({
  selector: 'anms-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss', './register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {
  registeredEmail$ = this.route.queryParamMap.pipe(map(qp => qp.get('email')));

  loading$ = this.store.select(selectAuthLoading);
  showPass = false;
  form = new UntypedFormGroup({
    email: new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    ]),
    password: new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/),
      Validators.minLength(8)
    ])
  });

  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ns: NotificationService,
    private ts: TranslateService
  ) {}

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.store.dispatch(authRegister({ credentials: { ...this.form.value } }));
    this.router.navigate(['./'], { queryParams: { email: this.form.value.email }, relativeTo: this.route });
  }

  async resendEmailVerification(): Promise<void> {
    const email = this.route.snapshot.queryParams.email;
    const sent = await this.authService.resendEmailVerification(email).toPromise();
    if (sent) {
      this.ns.success(this.ts.instant('anms.notification.verification-email-sent'));
    }
  }
}
