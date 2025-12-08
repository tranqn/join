import { Component, input, output, effect, HostListener } from '@angular/core';

@Component({
  selector: 'app-contact-modal',
  imports: [],
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
})
export class ContactModal {
  isOpen = input<boolean>(false);
  close = output<void>();


  constructor() {
    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }


  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen()) {
      this.close.emit();
    }
  }


  onClose() {
    this.close.emit();
  }
}
