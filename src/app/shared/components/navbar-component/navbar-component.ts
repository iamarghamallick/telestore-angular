import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      heroBars3,
      heroXMark
    })
  ],
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  private router = inject(Router);
  readonly isLoggedIn = this.authService.isLoggedIn;

  menuOpen = false;

  logout(): void {
    this.authService.logout();
    this.userService.clearProfile();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
