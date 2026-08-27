import { inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserProfile } from '../../shared/models/user-profile';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Service()
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiBaseUrl;

    private profileState = signal<UserProfile | null>(null);

    readonly profile = this.profileState.asReadonly();

    fetchProfie(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.baseUrl}/api/users/me`).pipe(
            tap(profile => this.profileState.set(profile)),
        );
    }

    updateProfile(data: { name: string }): Observable<UserProfile> {
        return this.http.put<UserProfile>(`${this.baseUrl}/api/users`, data).pipe(
            tap(profile => this.profileState.set(profile)),
        );
    }

    clearProfile(): void {
        this.profileState.set(null);
    }
}
