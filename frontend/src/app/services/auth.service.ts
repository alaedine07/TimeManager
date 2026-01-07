// frontend/src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`; // We'll create this backend controller
  private _token = new BehaviorSubject<string | null>(localStorage.getItem('token'));

  token$ = this._token.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          this._token.next(res.token);
        })
      );
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          this._token.next(res.token);
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('taskTimers');
    this._token.next(null);
  }

  get token(): string | null {
    return this._token.value;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }
}
