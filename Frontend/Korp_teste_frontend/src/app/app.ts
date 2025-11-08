import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Home } from './pages/home/home'; // Você já deve ter algo assim

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [RouterOutlet, Home, MatToolbarModule],
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Korp_teste_frontend');
}
