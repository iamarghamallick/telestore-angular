import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowDownTray, heroArrowRight, heroArrowsRightLeft, heroCheckCircle, heroCloudArrowUp, heroDocument, heroDocumentText, heroFolder, heroHome, heroLockClosed, heroMagnifyingGlass, heroServerStack, heroShieldCheck, heroUser } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-home-component',
  imports: [
    RouterLink,
    NgIcon
  ],
  providers: [
    provideIcons({
      heroArrowRight,
      heroCheckCircle,
      heroCloudArrowUp,
      heroHome,
      heroMagnifyingGlass,
      heroFolder,
      heroDocumentText,
      heroDocument,
      heroArrowDownTray,
      heroArrowsRightLeft,
      heroServerStack,
      heroShieldCheck,
      heroLockClosed,
      heroUser
    })
  ],
  templateUrl: './home-component.html'
})
export class HomeComponent {

  private authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn;
}