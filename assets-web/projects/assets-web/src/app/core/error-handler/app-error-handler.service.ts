import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { authLogout } from '../core.module';
import { NotificationService } from '../notifications/notification.service';

/**
 * Application-wide error handler that adds a UI notification to the error handling
 * provided by the default Angular ErrorHandler.
 */

marker('server.errors.assets.limit');
marker('server.errors.categories.limit');
marker('server.errors.auth.error');
marker('server.errors.auth.invalid-credentials');
marker('server.errors.auth.user-not-verified');
marker('server.errors.auth.already-registered');
marker('server.errors.auth.login-sent-recently');
marker('server.errors.auth.reset_password_sent_recently');
marker('server.errors.auth.user-not-registered');
marker('server.errors.auth.user-not-found');
marker('server.errors.auth.no-password-provided');
marker('server.errors.auth.change-password');
marker('server.errors.auth.wrong-current-password');
marker('server.errors.auth.wrong-email-token');
marker('server.errors.api.moex');
marker('server.errors.api.yahoo');
marker('server.errors.api.currency');
marker('server.errors.api.crypto');

@Injectable()
export class AppErrorHandler extends ErrorHandler {
  constructor(private notificationsService: NotificationService, private injector: Injector) {
    super();
  }

  handleError(error: Error | HttpErrorResponse) {
    if (error instanceof HttpErrorResponse) {
      const translate = this.injector.get(TranslateService);
      this.notificationsService.error(translate.instant(error.error.message));
      if (error.status === 401 && error.error.message === 'Unauthorized') {
        const store = this.injector.get(Store);
        store.dispatch(authLogout());
        location.reload();
      }
    }

    super.handleError(error);
  }
}
