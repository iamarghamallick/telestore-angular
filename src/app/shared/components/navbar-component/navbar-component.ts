import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly isLoggedIn = this.authService.isLoggedIn;

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
