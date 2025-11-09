import { Component, signal } from '@angular/core';
// 1. IMPORTE AS FERRAMENTAS DE ROTA QUE FALTAM
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; 
import { MatToolbarModule } from '@angular/material/toolbar';
import { Home } from './pages/home/home';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  standalone: true, // Garanta que isso está aqui
  templateUrl: './app.html',
  imports: [
    RouterOutlet, 
    Home, 
    MatToolbarModule, 
    MatTabsModule,
    RouterLink, // <-- 2. ADICIONE AQUI
    RouterLinkActive // <-- 3. ADICIONE AQUI
  ],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Korp_teste_frontend');
}