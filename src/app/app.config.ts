import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideFirebaseApp(() => initializeApp({ 
      projectId: "join-9776e", 
      appId: "1:949796685452:web:99aee8c2e372fcb2e91da9", 
      databaseURL: "https://join-9776e-default-rtdb.europe-west1.firebasedatabase.app", 
      storageBucket: "join-9776e.firebasestorage.app", 
      apiKey: "AIzaSyDGKyDylxYi0J6hWxgWE2HR1IgaBegByAY", 
      authDomain: "join-9776e.firebaseapp.com", 
      messagingSenderId: "949796685452"
    })), 
    provideDatabase(() => getDatabase())
  ]
};
