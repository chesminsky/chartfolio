import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { authLoginSuccess } from '../../core/auth/auth.actions';
import { NotificationService, authLogin } from '../../core/core.module';
import { selectAuthState } from '../../core/core.state';


@Component({
  selector: 'anms-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  auth$ = this.store.pipe(select(selectAuthState));
  showForm = true;
  showPass = false;
  form = new UntypedFormGroup({
    email: new UntypedFormControl('', Validators.required),
    password: new UntypedFormControl('', Validators.required)
  });

  constructor(
    private store: Store,
    private ns: NotificationService,
    private route: ActivatedRoute,
    private ts: TranslateService
  ) {}

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.store.dispatch(authLogin({ credentials: { ...this.form.value } }));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(qp => {
      if (qp.type === 'oauth') {
        if (qp.success === 'true') {
          this.showForm = false;
          setTimeout(() => {
            this.store.dispatch(
              authLoginSuccess({
                auth: {
                  token: qp.token,
                  username: qp.username
                }
              })
            );
          });
        }
        if (qp.success === 'false') {
          setTimeout(() => {
            this.ns.error(this.ts.instant('anms.notification.auth-error'));
          });
        }
      }

      if (qp.type === 'email') {
        if (qp.success === 'true') {
          setTimeout(() => {
            this.ns.success(this.ts.instant('anms.notification.email-verified'));
          });
        }
        if (qp.success === 'false') {
          setTimeout(() => {
            this.ns.error(this.ts.instant('anms.notification.email-verify-link-invalid'));
          });
        }
      }
    });
  }
}
