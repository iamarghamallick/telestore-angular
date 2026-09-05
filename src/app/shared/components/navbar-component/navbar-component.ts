import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroCloudArrowUp, heroHome, heroUserCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon, AsyncPipe],
  providers: [
    provideIcons({
      heroBars3,
      heroXMark,
      heroHome,
      heroUserCircle,
      heroCloudArrowUp,
    })
  ],
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);

  private router = inject(Router);
  isAuthenticated$ = this.authService.isAuthenticated$;

  menuOpen = false;

  logout(): void {
    this.authService.logout().subscribe();
    this.userService.clearProfile();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
