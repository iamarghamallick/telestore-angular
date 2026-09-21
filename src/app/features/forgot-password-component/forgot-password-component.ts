import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowPath, heroCheckCircle, heroEnvelope, heroExclamationTriangle } from '@ng-icons/heroicons/outline';

@Component({
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroExclamationTriangle,
      heroEnvelope,
      heroArrowPath,
      heroCheckCircle
    })
  ],
  selector: 'app-forgot-password-component',
  templateUrl: './forgot-password-component.html',
})
export class ForgotPasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  submitted = signal(false);
  submittedEmail = signal('');
  errorMessage = signal<string | null>(null);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.forgotPasswordForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) this.errorMessage.set(null);
    });
  }

  submit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.forgotPasswordForm.getRawValue();

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submittedEmail.set(email);
        this.submitted.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  // Lets the user go back and try a different email from the success screen.
  tryAnotherEmail(): void {
    this.submitted.set(false);
    this.forgotPasswordForm.reset();
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Can't reach the server. Check your connection and try again.";
    }
    if (err.status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (err.status >= 500) {
      return 'Something went wrong on our end. Please try again shortly.';
    }
    return 'Something went wrong. Please try again.';
  }
}