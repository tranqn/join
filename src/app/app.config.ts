import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      projectId: "join-9776e",
      appId: "1:949796685452:web:99aee8c2e372fcb2e91da9",
      storageBucket: "join-9776e.firebasestorage.app",
      apiKey: "AIzaSyDGKyDylxYi0J6hWxgWE2HR1IgaBegByAY",
      authDomain: "join-9776e.firebaseapp.com",
      messagingSenderId: "949796685452"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MessageService
  ]
};
