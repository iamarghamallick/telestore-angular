import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({ heroCloudArrowUp })
  ],
  selector: 'app-footer-component',
  templateUrl: './footer-component.html',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
