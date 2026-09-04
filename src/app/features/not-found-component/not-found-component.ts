import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp, heroFolder, heroHome } from '@ng-icons/heroicons/outline';
import { AuthService } from '../../core/services/auth-service';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  imports: [RouterLink, NgIcon, AsyncPipe],
  providers: [
    provideIcons({
      heroHome,
      heroCloudArrowUp,
      heroFolder,
    })
  ],
  selector: 'app-not-found-component',
  templateUrl: './not-found-component.html',
})
export class NotFoundComponent {
  private authService = inject(AuthService);

  isAuthenticated$ = this.authService.isAuthenticated$;
}
