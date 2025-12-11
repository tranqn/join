import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  isOpen = signal(false);
  message = signal('');
  private acceptCallback?: () => void;

  /**
   * Displays the confirmation modal with a message and callback.
   * @param message - The message to display in the modal
   * @param onAccept - Callback function to execute when confirmed
   */
  show(message: string, onAccept: () => void) {
    this.message.set(message);
    this.acceptCallback = onAccept;
    this.isOpen.set(true);
  }

  /**
   * Executes the accept callback and closes the modal.
   */
  confirm() {
    if (this.acceptCallback) {
      this.acceptCallback();
    }
    this.close();
  }

  /**
   * Closes the modal without executing the accept callback.
   */
  reject() {
    this.close();
  }

  /**
   * Closes the modal and resets all state.
   */
  private close() {
    this.isOpen.set(false);
    this.message.set('');
    this.acceptCallback = undefined;
  }
}
