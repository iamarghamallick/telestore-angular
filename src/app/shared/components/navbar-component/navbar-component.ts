import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../../core/services/user-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowRightOnRectangle,
  heroBars3,
  heroCloudArrowUp,
  heroHome,
  heroUserCircle,
  heroXMark,
  heroArrowPath,
  heroSun,
  heroMoon
} from '@ng-icons/heroicons/outline';
import { AsyncPipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme-service';

@Component({
  imports: [RouterLink, RouterLinkActive, NgIcon, AsyncPipe],
  providers: [
    provideIcons({
      heroBars3,
      heroXMark,
      heroHome,
      heroUserCircle,
      heroCloudArrowUp,
      heroArrowRightOnRectangle,
      heroSun,
      heroMoon,
    }),
  ],
  selector: 'app-navbar-component',
  templateUrl: './navbar-component.html',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private elementRef = inject(ElementRef<HTMLElement>);

  themeService = inject(ThemeService);

  isAuthenticated$ = this.authService.isAuthenticated$;
  isLoggingOut = signal(false);

  profileInitial = computed(() => {
    const name = this.userService.profile()?.name;
    return name ? name.charAt(0).toUpperCase() : null;
  });

  menuOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.lockBodyScroll(false));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  // Close the mobile menu on any click that lands outside this component.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;
    const target = event.target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }

  logout(): void {
    if (this.isLoggingOut()) return;
    this.isLoggingOut.set(true);

    this.authService
      .logout()
      .pipe(finalize(() => this.isLoggingOut.set(false)))
      .subscribe({
        next: () => this.handleLoggedOut(),
        error: () => this.handleLoggedOut(),
      });
  }

  private handleLoggedOut(): void {
    this.userService.clearProfile();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    this.lockBodyScroll(this.menuOpen());
  }

  closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.lockBodyScroll(false);
  }

  private lockBodyScroll(lock: boolean): void {
    document.body.style.overflow = lock ? 'hidden' : '';
  }
}