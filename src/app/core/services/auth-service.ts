import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../../shared/models/auth-response';
import { environment } from '../../../environments/environment';

@Service()
export class AuthService {
    private http = inject(HttpClient);
    private readonly TOKEN_KEY = "auth-token";
    private baseUrl = environment.apiBaseUrl;

    currentUserToken = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

    login(credentials: { email: string, password: string }): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem(this.TOKEN_KEY, response.token);
                this.currentUserToken.set(response.token);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUserToken.set(null);
    }

    isLoggedIn(): boolean {
        return this.currentUserToken() !== null;
    }
};
