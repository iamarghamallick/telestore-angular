import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth-service';
import { heroArrowDownTray, heroArrowRight, heroArrowsRightLeft, heroCheckCircle, heroCloudArrowUp, heroDocument, heroDocumentText, heroFolder, heroHome, heroLockClosed, heroMagnifyingGlass, heroServerStack, heroShieldCheck, heroUser } from '@ng-icons/heroicons/outline';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home-component',
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroCloudArrowUp,
      heroArrowRight,
      heroCheckCircle,
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

  isAuthenticated = this.authService.isAuthenticated === true;
}