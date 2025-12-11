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

  onConfirm() {
    this.confirmationService.confirm();
  }

  onReject() {
    this.confirmationService.reject();
  }

  onBackdropClick() {
    this.confirmationService.reject();
  }
}
