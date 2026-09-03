import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/auth-response';
import { environment } from '../../../environments/environment';

@Service()
export class AuthService {
    private http = inject(HttpClient);
    private readonly TOKEN_KEY = "auth-token";
    private readonly REFRESH_TOKEN_KEY = "refresh-token";
    private baseUrl = environment.apiBaseUrl;

    private authenticated = signal(
        !!localStorage.getItem(this.TOKEN_KEY)
    );

    readonly isLoggedIn = this.authenticated.asReadonly();
    readonly googleOAuth2Url = signal<string>(`${this.baseUrl}/oauth2/authorization/google`);

    setToken(token: string, refreshToken: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        this.authenticated.set(true);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        this.authenticated.set(false);
    }

    register(credentials: { name: string, email: string, password: string }): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/register`, credentials);
    }

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, credentials).pipe(
            tap(response => this.setToken(response.token, response.refreshToken))
        );
    }
};
