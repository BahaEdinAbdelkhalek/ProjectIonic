import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CONFIG } from '../config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private token = '';

  constructor(private http: HttpClient) {}

  get apiUrl(): string {
    return CONFIG.apiUrl;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('django_token', token);
  }

  getToken(): string {
    if (this.token === '') {
      this.token = localStorage.getItem('django_token') ?? '';
    }

    return this.token;
  }

  effacerToken(): void {
    this.token = '';
    localStorage.removeItem('django_token');
  }

  private headers(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const token = this.getToken();

    if (token !== '') {
      headers = headers.set('Authorization', 'Token ' + token);
    }

    return headers;
  }

  get<T>(chemin: string) {
    return this.http.get<T>(this.apiUrl + chemin, { headers: this.headers() });
  }

  post<T>(chemin: string, corps: unknown) {
    return this.http.post<T>(this.apiUrl + chemin, corps, { headers: this.headers() });
  }
}