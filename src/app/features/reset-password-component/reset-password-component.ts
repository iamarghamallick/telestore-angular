import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowPath, heroCheckCircle, heroCloudArrowUp, heroExclamationTriangle, heroEye, heroEyeSlash, heroLockClosed } from '@ng-icons/heroicons/outline';

@Component({
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroCloudArrowUp,
      heroEye,
      heroEyeSlash,
      heroLockClosed,
      heroExclamationTriangle,
      heroCheckCircle,
      heroArrowPath
    })
  ],
  selector: 'app-reset-password-component',
  templateUrl: './reset-password-component.html',
})
export class ResetPasswordComponent {
  private fb = inject(NonNullableFormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  token = '';
  tokenMissing = signal(false);

  isLoading = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  resetPasswordForm = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordsMatchValidator] },
  );

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.tokenMissing.set(true);
    } else {
      this.resetPasswordForm.valueChanges.subscribe(() => {
        if (this.errorMessage()) this.errorMessage.set(null);
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  submit(): void {
    if (this.tokenMissing()) return;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { password } = this.resetPasswordForm.getRawValue();

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Can't reach the server. Check your connection and try again.";
    }
    if (err.status === 400 || err.status === 401 || err.status === 410) {
      return 'This password reset link is invalid or has expired.';
    }
    if (err.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (err.status >= 500) {
      return 'Something went wrong on our end. Please try again shortly.';
    }
    return 'Something went wrong. Please try again.';
  }
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}