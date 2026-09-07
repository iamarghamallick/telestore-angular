import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowPath, heroCloudArrowUp, heroEnvelope, heroExclamationTriangle, heroEye, heroEyeSlash, heroLockClosed } from '@ng-icons/heroicons/outline';

@Component({
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroCloudArrowUp,
      heroExclamationTriangle,
      heroEnvelope,
      heroLockClosed,
      heroEyeSlash,
      heroEye,
      heroArrowPath
    })
  ],
  selector: 'app-login-component',
  templateUrl: './login-component.html',
})
export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  googleOAuth2Url = this.authService.googleOAuth2Url;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showVerificationHelp = signal(false);
  showPassword = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  constructor() {
    // Clear a stale server-side error as soon as the user edits the form again.
    this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) this.errorMessage.set(null);
      if (this.showVerificationHelp()) this.showVerificationHelp.set(false);
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.showVerificationHelp.set(false);
    this.isLoading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['drive/my-drive']),
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        if (err.status === 403) {
          this.showVerificationHelp.set(true);
        }
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Can't reach the server right now. Check your connection and try again.";
    }
    if (err.status === 401 || err.status === 400) {
      return 'Incorrect email or password. Please try again.';
    }
    if (err.status === 403) {
      return 'Your email address is not verified yet. Check your inbox or resend the verification email.';
    }
    if (err.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (err.status >= 500) {
      return "Something went wrong on our end. Please try again shortly.";
    }
    return 'Login failed. Please try again.';
  }
}