import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowPath, heroCheckCircle, heroXCircle } from '@ng-icons/heroicons/outline';

@Component({
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroXCircle,
      heroCheckCircle,
      heroArrowPath
    })
  ],
  selector: 'app-verify-email-component',
  templateUrl: './verify-email-component.html',
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(true);
  success = signal(false);
  error = signal(false);

  // Auto-redirect countdown after success, with a manual escape hatch.
  redirectCountdown = signal(0);
  private redirectInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.stopRedirectCountdown());

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading.set(false);
      this.error.set(true);
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.success.set(true);
        this.startRedirectCountdown();
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set(true);
      },
    });
  }

  goToLogin(): void {
    this.stopRedirectCountdown();
    this.router.navigate(['/login']);
  }

  private startRedirectCountdown(): void {
    this.redirectCountdown.set(5);
    this.redirectInterval = setInterval(() => {
      this.redirectCountdown.update((c) => c - 1);
      if (this.redirectCountdown() <= 0) {
        this.stopRedirectCountdown();
        this.goToLogin();
      }
    }, 1000);
  }

  private stopRedirectCountdown(): void {
    if (this.redirectInterval) {
      clearInterval(this.redirectInterval);
      this.redirectInterval = undefined;
    }
  }
}