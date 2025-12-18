import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Auth, Credentials, ResetPassword } from './auth.models';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AUTH_KEY } from './auth.constants';
import { environment } from '../../../environments/environment';
import { catchError, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.authUrl;
  constructor(private http: HttpClient, private lsService: LocalStorageService) {}

  login({ email, password }: Credentials): Observable<Auth> {
    return this.http.post<Auth>(`${this.baseUrl}/email/login`, {
      email,
      password
    });
  }

  register({ email, password }: Credentials): Observable<Auth> {
    return this.http.post<Auth>(`${this.baseUrl}/email/register`, {
      email,
      password
    });
  }

  getToken(): string {
    const auth = this.lsService.getItem(AUTH_KEY);
    return auth ? auth.token : null;
  }

  resetPassword(email: string): Observable<boolean> {
    return this.http.get<void>(`${this.baseUrl}/email/forgot-password/${email}`).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }

  changePassword(dto: ResetPassword): Observable<boolean> {
    return this.http.post<void>(`${this.baseUrl}/email/change-password`, dto).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }

  resendEmailVerification(email: string): Observable<boolean> {
    return this.http.get<void>(`${this.baseUrl}/email/resend-verification/${email}`).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }
}
