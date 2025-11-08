import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// Imports necessários
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), // Para o Zone.js
    provideRouter(routes),
    provideClientHydration(),
    
    provideAnimations(), // Para o Material Animations
    provideHttpClient(withFetch()), // Para o HttpClient
    importProvidersFrom(MatSnackBarModule) // Para o MatSnackBar
  ]
};