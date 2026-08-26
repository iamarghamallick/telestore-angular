import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/login-component/login-component';
import { DashboardComponent } from './features/dashboard-component/dashboard-component';
import { HomeComponent } from './features/home-component/home-component';
import { RegisterComponent } from './features/register-component/register-component';
import { OauthSuccessComponent } from './features/oauth-success-component/oauth-success-component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'login/oauth2/oauth-success',
        component: OauthSuccessComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
    },
];
