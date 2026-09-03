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
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'register',
        pathMatch: 'full',
        component: RegisterComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'login',
        pathMatch: 'full',
        component: LoginComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'login/oauth2/oauth-success',
        pathMatch: 'full',
        component: OauthSuccessComponent,
        canActivate: [loginGuard],
    },
    {
        path: 'drive/my-drive',
        pathMatch: 'full',
        component: DashboardComponent,
        canActivate: [authGuard],
    },
    {
        path: 'drive',
        pathMatch: 'full',
        redirectTo: 'drive/my-drive',
    },
    {
        path: 'profile',
        pathMatch: 'full',
        component: ProfileComponent,
        canActivate: [authGuard],
    },
    {
        path: '**',
        component: NotFoundComponent,
    },
];
