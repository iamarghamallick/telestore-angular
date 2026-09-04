import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { BehaviorSubject, catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/auth-response';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Service()
export class AuthService {
    private baseUrl = environment.apiBaseUrl;
    private http = inject(HttpClient);
    private router = inject(Router);
    private accessToken: string | null = null;
    private authenticatedSubject = new BehaviorSubject<boolean | null>(null);

    readonly isAuthenticated$ = this.authenticatedSubject.asObservable();

    private refreshInProgress$: Observable<string> | null = null;

    get isAuthenticated(): boolean | null {
        return this.authenticatedSubject.value;
    }

    getToken(): string | null {
        return this.accessToken;
    }

    setToken(token: string, refreshToken: string): void {
        this.accessToken = token;
        this.authenticatedSubject.next(true);
        localStorage.setItem("refresh-token", refreshToken);
    }

    readonly googleOAuth2Url: string = `${this.baseUrl}/oauth2/authorization/google`;

    getRefreshToken(): string | null {
        return localStorage.getItem("refresh-token");
    }

    register(credentials: { name: string, email: string, password: string }): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/register`, credentials);
    }

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, credentials).pipe(
            tap(response => {
                this.setToken(response.token, response.refreshToken);
            })
        );
    }

    refresh(credentials: { refreshToken: string | null }): Observable<string> {

        if (this.refreshInProgress$) {
            return this.refreshInProgress$;
        }

        this.refreshInProgress$ = this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/refresh`, credentials).pipe(
            tap(response => {
                this.setToken(response.token, response.refreshToken);
            }),
            map(response => response.token),
            finalize(() => {
                this.refreshInProgress$ = null;
            }),
            shareReplay(1)
        );

        return this.refreshInProgress$;
    }

    private clearAuth(): void {
        this.accessToken = null;
        this.authenticatedSubject.next(false);
        localStorage.removeItem("refresh-token");
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/logout`,
            { refreshToken: this.getRefreshToken() }
        ).pipe(
            finalize(() => {
                this.clearAuth();
                this.router.navigate(['/login']);
            })
        );
    }

    initializeAuth(): Observable<boolean> {

        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            this.clearAuth();
            return of(false);
        }

        return this.refresh({ refreshToken }).pipe(
            map(() => true),

            catchError(() => {
                this.clearAuth();
                this.router.navigate(['/login']);
                return of(false);
            })
        );
    }
};
