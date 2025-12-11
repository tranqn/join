import { Component, input, output, effect, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContactModel } from '../../../interfaces/contact';
import { FirebaseService } from '../../../services/firebase-service';
import { ColorService } from '../../../services/color-service';
import { minLengthValidator, emailValidator, phoneValidator, getErrorMessage } from './contact-validators';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from '../../../shared/confirmation-modal/confirmation.service';

@Component({
  selector: 'app-contact-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-modal.html',
  styleUrl: './contact-modal.scss',
})
export class ContactModal {
  isOpen = input<boolean>(false);
  contact = input<ContactModel | null>(null);
  close = output<void>();

  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private colorService = inject(ColorService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  contactForm: FormGroup;
  isSaving = signal(false);


  constructor() {
    this.contactForm = this.initializeForm();

    effect(() => {
      if (this.isOpen()) {
        document.body.style.overflow = 'hidden';
        this.updateFormWithContact();
      } else {
        document.body.style.overflow = '';
      }
    });
  }


  initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', minLengthValidator(2)],
      email: ['', emailValidator()],
      phone: ['', phoneValidator()]
    });
  }


  updateFormWithContact() {
    const currentContact = this.contact();
    if (currentContact) {
      this.contactForm.patchValue({
        name: currentContact.name,
        email: currentContact.email,
        phone: currentContact.phone
      });
    } else {
      this.contactForm.reset();
    }
  }


  async onSubmit() {
    if (this.contactForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    try {
      await this.saveContact();
      this.close.emit();
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      this.isSaving.set(false);
    }
  }


  async saveContact() {
    const formValue = this.contactForm.value;
    const existingContact = this.contact();

    if (existingContact) {
      await this.updateExistingContact(existingContact, formValue);
    } else {
      await this.createNewContact(formValue);
    }
  }


  async createNewContact(formValue: any) {
    const newContact = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      color: this.getRandomColor()
    };
    await this.firebaseService.addContact(newContact);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact successfully created',
      life: 3000
    });
  }


  async updateExistingContact(existing: ContactModel, formValue: any) {
    const updated: ContactModel = {
      ...existing,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone
    };
    await this.firebaseService.updateContact(updated);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact successfully updated',
      life: 3000
    });
  }


  getRandomColor(): string {
    const colors = this.colorService.profilColors;
    return colors[Math.floor(Math.random() * colors.length)];
  }


  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return getErrorMessage(fieldName, control.errors);
    }
    return '';
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


  onDelete() {
    const currentContact = this.contact();
    if (!currentContact) return;

    this.confirmationService.show(
      `Are you sure you want to delete ${currentContact.name}?`,
      async () => {
        this.isSaving.set(true);
        try {
          await this.firebaseService.deleteContact(currentContact.id);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Contact successfully deleted',
            life: 3000
          });
          this.close.emit();
        } catch (error) {
          console.error('Error deleting contact:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete contact',
            life: 3000
          });
        } finally {
          this.isSaving.set(false);
        }
      }
    );
  }
}
