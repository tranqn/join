import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ConfirmationModal } from './shared/confirmation-modal/confirmation-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmationModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('join');
}
