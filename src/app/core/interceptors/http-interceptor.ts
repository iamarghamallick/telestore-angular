import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";

const PUBLIC_ENDPOINTS = [
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/resend-verification",
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/oauth2/"
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isPublicEndpoint = (url: string): boolean => {
        return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
    };

    const addToken = (request: HttpRequest<any>, token: string | null): HttpRequest<any> => {
        return request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    };

    const forceLogout = (): void => {
        authService.logout().subscribe();
        router.navigate(['/login']);
    };

    if (isPublicEndpoint(req.url)) {
        return next(req);
    }

    const token = authService.getToken();

    let modifiedReq = addToken(req, token);

    return next(modifiedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                return authService.refresh().pipe(
                    switchMap(newToken => {
                        const retryRequest = addToken(req, newToken);
                        return next(retryRequest);
                    }),
                    catchError(refreshError => {
                        forceLogout();
                        return throwError(() => refreshError);
                    })
                )
            }
            return throwError(() => error);
        })
    );
};
