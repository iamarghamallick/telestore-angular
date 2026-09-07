import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/guards/auth-guard';
import { LoginComponent } from './features/login-component/login-component';
import { DashboardComponent } from './features/dashboard-component/dashboard-component';
import { HomeComponent } from './features/home-component/home-component';
import { RegisterComponent } from './features/register-component/register-component';
import { OauthSuccessComponent } from './features/oauth-success-component/oauth-success-component';
import { ProfileComponent } from './features/profile-component/profile-component';
import { NotFoundComponent } from './features/not-found-component/not-found-component';
import { ForgotPasswordComponent } from './features/forgot-password-component/forgot-password-component';
import { ResetPasswordComponent } from './features/reset-password-component/reset-password-component';
import { ResendVerificationComponent } from './features/resend-verification-component/resend-verification-component';
import { VerifyEmailComponent } from './features/verify-email-component/verify-email-component';

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
        path: 'forgot-password',
        pathMatch: 'full',
        component: ForgotPasswordComponent,
    },
    {
        path: 'reset-password',
        pathMatch: 'full',
        component: ResetPasswordComponent,
    },
    {
        path: 'resend-verification',
        pathMatch: 'full',
        component: ResendVerificationComponent,
    },
    {
        path: 'verify-email',
        pathMatch: 'full',
        component: VerifyEmailComponent,
    },
    {
        path: '**',
        component: NotFoundComponent,
    },
];
