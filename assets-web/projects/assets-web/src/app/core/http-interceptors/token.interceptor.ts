/* tslint:disable:no-any */

import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
	private authService: AuthService;
	constructor(private injector: Injector) {}
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		this.authService = this.injector.get(AuthService);
		const token: string = this.authService.getToken();
		if (token) {
			request = request.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
		}
		return next.handle(request);
	}
}
