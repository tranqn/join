import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  isOpen = signal(false);
  message = signal('');
  private acceptCallback?: () => void;

  show(message: string, onAccept: () => void) {
    this.message.set(message);
    this.acceptCallback = onAccept;
    this.isOpen.set(true);
  }

  confirm() {
    if (this.acceptCallback) {
      this.acceptCallback();
    }
    this.close();
  }

  reject() {
    this.close();
  }

  private close() {
    this.isOpen.set(false);
    this.message.set('');
    this.acceptCallback = undefined;
  }
}
