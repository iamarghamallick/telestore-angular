import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated === true) {
        return true;
    }

    router.navigate(['/login']);

    return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated === true) {
        router.navigate(['drive/my-drive']);
    }

    return true;
};