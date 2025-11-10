import { Component, signal } from '@angular/core';
// 1. IMPORTE RouterLink e RouterLinkActive
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { Home } from './pages/home/home';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.html',
  imports: [
    RouterOutlet, 
    Home, 
    MatToolbarModule, 
    MatTabsModule,
    RouterLink,
    RouterLinkActive
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Korp_teste_frontend');
}