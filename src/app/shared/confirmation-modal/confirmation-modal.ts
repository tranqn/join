import { Component, inject } from '@angular/core';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'app-confirmation-modal',
  imports: [],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss'
})
export class ConfirmationModal {
  confirmationService = inject(ConfirmationService);

  /**
   * Handles the confirm action in the modal.
   */
  onConfirm() {
    this.confirmationService.confirm();
  }

  /**
   * Handles the reject action in the modal.
   */
  onReject() {
    this.confirmationService.reject();
  }

  /**
   * Handles clicks on the modal backdrop to close the modal.
   */
  onBackdropClick() {
    this.confirmationService.reject();
  }
}
