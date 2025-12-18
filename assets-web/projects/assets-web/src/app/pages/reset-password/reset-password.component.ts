import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/core.module';

@Component({
  selector: 'anms-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../login/login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent {
  loading = false;
  showPass = false;
  showConfirmPass = false;
  showOldPass = false;

  hasToken$ = this.route.params.pipe(map(p => p.token));

  form: UntypedFormGroup;

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private ns: NotificationService,
    private router: Router,
    private ts: TranslateService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.matchPasswordValidator = this.matchPasswordValidator.bind(this);

    this.form = new UntypedFormGroup({
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]),
      password: new UntypedFormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.{8,})/),
        Validators.minLength(8)
      ]),
      confirmPassword: new UntypedFormControl('', [Validators.required, this.matchPasswordValidator])
    });

    this.hasToken$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(token => {
      if (!token) {
        this.form.addControl('oldPassword', new UntypedFormControl('', Validators.required));
      } else {
        this.form.removeControl('oldPassword');
      }

      this.form.updateValueAndValidity();
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      return;
    }

    this.loading = true;
    const sent = await this.authService
      .changePassword({
        email: this.form.value.email,
        newPassword: this.form.value.password,
        newPasswordToken: this.route.snapshot.params.token,
        currentPassword: this.form.value.oldPassword
      })
      .toPromise();

    this.loading = false;

    if (sent) {
      this.ns.success(this.ts.instant('anms.notification.password-changed'));
      this.router.navigate(['/login']);
    }

    this.cd.detectChanges();
  }

  private matchPasswordValidator(control: UntypedFormControl): ValidationErrors {
    if (control.value && control.value !== this.form.get('password').value) {
      return { passwordNotMatch: true };
    }

    return null;
  }
}
