import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroHeart } from '@ng-icons/heroicons/outline';
import { phosphorGithubLogoBold, phosphorLinkedinLogoBold } from '@ng-icons/phosphor-icons/bold';

@Component({
  imports: [NgIcon],
  providers: [
    provideIcons({ heroHeart, phosphorGithubLogoBold, phosphorLinkedinLogoBold }),
  ],
  selector: 'app-footer-component',
  templateUrl: './footer-component.html',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  developerName = 'Argha Mallick';
  githubUrl = 'https://github.com/iamarghamallick';
  linkedinUrl = 'https://www.linkedin.com/in/iamarghamallick';
}