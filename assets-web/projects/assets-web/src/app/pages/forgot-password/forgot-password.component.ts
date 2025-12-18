import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'anms-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.scss', './forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  loading = false;

  form = new UntypedFormGroup({
    email: new UntypedFormControl('', [
      Validators.required,
      Validators.pattern(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    ])
  });

  email$ = this.route.queryParamMap.pipe(map(qp => qp.get('email')));

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async onSubmit(): Promise<void> {
    if (!this.form.valid) {
      return;
    }
    this.loading = true;
    const sent = await this.authService.resetPassword(this.form.value.email).toPromise();

    this.loading = false;

    if (sent) {
      this.router.navigate(['./'], { queryParams: { email: this.form.value.email }, relativeTo: this.route });
    }

    this.cd.detectChanges();
  }
}
