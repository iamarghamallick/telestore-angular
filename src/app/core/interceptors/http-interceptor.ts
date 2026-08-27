import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

const PUBLIC_ENDPOINTS = [
    "/api/auth/register",
    "/api/auth/login",
    "/oauth2/"
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isPublicEndpoint = (url: string): boolean => {
        return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
    };

    const addToken = (request: HttpRequest<any>, token: string): HttpRequest<any> => {
        return request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    };

    const forceLogout = (): void => {
        authService.logout();
        router.navigate(['/login']);
    };

    if (isPublicEndpoint(req.url)) {
        return next(req);
    }

    const token = authService.getToken();
    let modifiedReq = req;

    if (token) {
        modifiedReq = addToken(req, token);
    } else {
        forceLogout();
    }

    return next(modifiedReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse) {
                forceLogout();
            }
            return throwError(() => error);
        })
    );
};
