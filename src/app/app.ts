import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmationModal } from './shared/confirmation-modal/confirmation-modal';
import { SplashScreen } from './shared/splash-screen/splash-screen';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmationModal, SplashScreen],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
}
