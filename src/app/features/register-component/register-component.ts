import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowPath, heroCheckCircle, heroEnvelope, heroExclamationTriangle, heroEye, heroEyeSlash, heroLockClosed, heroUser } from '@ng-icons/heroicons/outline';

@Component({
  imports: [ReactiveFormsModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroEye,
      heroEyeSlash,
      heroLockClosed,
      heroUser,
      heroExclamationTriangle,
      heroArrowPath,
      heroEnvelope,
      heroCheckCircle
    })
  ],
  selector: 'app-register-component',
  templateUrl: './register-component.html',
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);

  googleOAuth2Url = this.authService.googleOAuth2Url;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showSuccess = signal(false);
  registeredEmail = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.fb.group(
    {
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordsMatchValidator] },
  );

  constructor() {
    this.registerForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) this.errorMessage.set(null);
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    const { name, email, password } = this.registerForm.getRawValue();

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showSuccess.set(true);
        this.registeredEmail.set(email);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Can't reach the server right now. Check your connection and try again.";
    }
    if (err.status === 409) {
      return 'An account with this email already exists. Try logging in instead.';
    }
    if (err.status === 400) {
      return 'Please check your details and try again.';
    }
    if (err.status === 429) {
      return 'Too many attempts. Please wait a moment and try again.';
    }
    if (err.status >= 500) {
      return 'Something went wrong on our end. Please try again shortly.';
    }
    return 'Registration failed. Please try again.';
  }
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}