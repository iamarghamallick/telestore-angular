import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });

    return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};