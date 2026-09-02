import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/components/navbar-component/navbar-component";
import { FooterComponent } from "./shared/components/footer-component/footer-component";

@Component({
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('telestore-angular');
}
