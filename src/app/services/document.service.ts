import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = '/api-efact-ose/v1';

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getCdr(ticket: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/cdr/${ticket}`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  getXml(ticket: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/xml/${ticket}`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }

  getPdf(ticket: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/pdf/${ticket}`, {
      headers: this.getHeaders(),
      responseType: 'blob',
    });
  }
}
