import { HttpInterceptorFn } from "@angular/common/http";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core";

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.currentUserToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};