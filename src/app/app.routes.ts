import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/login-component/login-component';
import { DashboardComponent } from './features/dashboard-component/dashboard-component';
import { HomeComponent } from './features/home-component/home-component';
import { RegisterComponent } from './features/register-component/register-component';
import { OauthSuccessComponent } from './features/oauth-success-component/oauth-success-component';
import { ProfileComponent } from './features/profile-component/profile-component';
import { NotFoundComponent } from './features/not-found-component/not-found-component';

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
        path: 'drive/my-drive',
        component: DashboardComponent,
        canActivate: [authGuard],
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
    },
    {
        path: '**',
        component: NotFoundComponent,
    },
];
