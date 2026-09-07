import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowLeft, heroArrowPath, heroCheckCircle, heroEnvelope, heroExclamationTriangle } from '@ng-icons/heroicons/outline';

@Component({
  imports: [FormsModule, RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroCheckCircle,
      heroArrowLeft,
      heroArrowPath,
      heroEnvelope,
      heroExclamationTriangle
    })
  ],
  selector: 'app-resend-verification-component',
  templateUrl: './resend-verification-component.html',
})
export class ResendVerificationComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  email = '';

  isLoading = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);

  countdown = signal(0);
  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Prefill if we arrived here from a redirect (e.g. login/register passing ?email=...).
    const prefilled = this.route.snapshot.queryParamMap.get('email');
    if (prefilled) this.email = prefilled;

    this.destroyRef.onDestroy(() => this.stopCountdown());
  }

  resend(): void {
    this.errorMessage.set(null);

    const trimmed = this.email.trim();
    if (!trimmed) {
      this.errorMessage.set('Please enter your email address.');
      return;
    }

    if (this.countdown() > 0 || this.isLoading()) return;

    this.isLoading.set(true);

    this.authService.resendVerification(trimmed).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.submitted.set(true);
        this.startCountdown();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.resolveErrorMessage(err));
      },
    });
  }

  sendAgain(): void {
    this.submitted.set(false);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private startCountdown(): void {
    this.countdown.set(60);
    this.countdownInterval = setInterval(() => {
      this.countdown.update((c) => c - 1);
      if (this.countdown() <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
    this.countdown.set(0);
  }

  private resolveErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return "Can't reach the server. Check your connection and try again.";
    }
    if (err.status === 409) {
      return 'This email is already verified. You can log in directly.';
    }
    if (err.status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (err.status >= 500) {
      return 'Something went wrong on our end. Please try again shortly.';
    }
    return 'Something went wrong. Please try again later.';
  }
}