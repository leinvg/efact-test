import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly API_URL = '/api-efact-ose';

  private readonly tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());

  public token$ = this.tokenSubject.asObservable();

  private getStoredToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setStoredToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
  }

  private removeStoredToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      Authorization: 'Basic Y2xpZW50OnNlY3JldA==',
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams({
      grant_type: 'password',
      username,
      password,
    });

    return this.http
      .post<AuthResponse>(`${this.API_URL}/oauth/token`, body.toString(), { headers })
      .pipe(
        tap((response) => {
          this.setStoredToken(response.access_token);
          this.tokenSubject.next(response.access_token);
        })
      );
  }

  logout(): void {
    this.removeStoredToken();
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
