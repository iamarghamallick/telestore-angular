import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register-component',
  templateUrl: './register-component.html',
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  googleOAuth2Url = this.authService.googleOAuth2Url();

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.email, Validators.required]],
    password: ['', Validators.required],
  })

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.getRawValue()).subscribe({
        next: () => this.router.navigate(['login']),
        error: (err) => console.error("Registration failed", err),
      });
    }
  };
}
