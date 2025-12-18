import { ChangeDetectionStrategy, Component } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { environment } from '../../../environments/environment';

marker('anms.login.facebook-login');

@Component({
  selector: 'anms-social-auth',
  templateUrl: './social-auth.component.html',
  styleUrls: ['./social-auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SocialAuthComponent {
  googleLogin() {
    window.location.href = `${environment.authUrl}/google`;
  }

  facebookLogin() {
    window.location.href = `${environment.authUrl}/facebook`;
  }
}
