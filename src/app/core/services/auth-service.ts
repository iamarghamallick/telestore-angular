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

    setToken(token: string): void {
        this.accessToken = token;
        this.authenticatedSubject.next(true);
    }

    readonly googleOAuth2Url: string = `${this.baseUrl}/oauth2/authorization/google`;

    register(credentials: { name: string, email: string, password: string }): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/register`, credentials);
    }

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, credentials, { withCredentials: true }).pipe(
            tap(response => {
                this.setToken(response.token);
            })
        );
    }

    refresh(): Observable<string> {

        if (this.refreshInProgress$) {
            return this.refreshInProgress$;
        }

        this.refreshInProgress$ = this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/refresh`, {}, { withCredentials: true }).pipe(
            tap(response => {
                this.setToken(response.token);
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
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/logout`,
            {}, { withCredentials: true }
        ).pipe(
            finalize(() => {
                this.clearAuth();
                this.router.navigate(['/login']);
            })
        );
    }

    forgotPassword(email: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/auth/reset-password`, { token, newPassword });
    }

    initializeAuth(): Observable<boolean> {
        return this.refresh().pipe(
            map(() => true),

            catchError(() => {
                this.clearAuth();
                return of(false);
            })
        );
    }
};
