import { Component, input, output, effect, HostListener, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContactModel } from '../../../interfaces/contact';
import { FirebaseService } from '../../../services/firebase-service';
import { ColorService } from '../../../services/color-service';
import { minLengthValidator, emailValidator, phoneValidator, getErrorMessage } from './contact-validators';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from '../../../shared/confirmation-modal/confirmation.service';
import { getShortName } from '../contact';
import { AuthService } from '../../../services/auth.service';

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
  isClosing = signal(false);

  private fb = inject(FormBuilder);
  private firebaseService = inject(FirebaseService);
  private colorService = inject(ColorService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);

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


  /**
   * Initializes the contact form with validators.
   * @returns A FormGroup configured for contact data
   */
  initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', minLengthValidator(2)],
      email: ['', emailValidator()],
      phone: ['', phoneValidator()]
    });
  }


  /**
   * Updates the form with the current contact data or resets it if no contact is provided.
   */
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


  /**
   * Handles form submission, saving the contact data.
   */
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


  /**
   * Saves the contact by either creating a new one or updating an existing one.
   */
  async saveContact() {
    const formValue = this.contactForm.value;
    const existingContact = this.contact();

    if (existingContact) {
      await this.updateExistingContact(existingContact, formValue);
    } else {
      await this.createNewContact(formValue);
    }
  }


  /**
   * Creates a new contact with the provided form data.
   * @param formValue - The form data containing contact information
   */
  async createNewContact(formValue: any) {
    const newContact = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      color: this.colorService.getRandomColor()
    };
    await this.firebaseService.addItemToCollection(newContact, 'contacts');
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact successfully created',
      life: 3000
    });
  }


  /**
   * Updates an existing contact with new form data.
   * @param existing - The existing contact to update
   * @param formValue - The form data with updated information
   */
  async updateExistingContact(existing: ContactModel, formValue: any) {
    const updated: ContactModel = {
      ...existing,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone
    };
    await this.firebaseService.updateItem(updated, 'contacts');
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact successfully updated',
      life: 3000
    });
  }


  /**
   * Gets the error message for a specific form field.
   * @param fieldName - The name of the form field
   * @returns The error message string, or empty string if no error
   */
  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      return getErrorMessage(fieldName, control.errors);
    }
    return '';
  }


  /**
   * Handles the Escape key press to close the modal.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isOpen()) {
      this.onClose();
    }
  }


  /**
   * Emits an event to close the modal.
   */
  onClose() {
	this.isClosing.set(true);
	setTimeout(() => {
		this.close.emit();
		this.isClosing.set(false);
	}, 300);
  }


  /**
   * Handles contact deletion with confirmation dialog.
   */
  onDelete() {
    const currentContact = this.contact();
    if (!currentContact) return;

    this.confirmationService.show(
      `Are you sure you want to delete ${currentContact.name}?`,
      async () => {
        this.isSaving.set(true);
        try {
			// PRÜFUNG: Ist das der eigene Kontakt?
			const currentUser = this.authService.currentUser();
			if (currentUser && currentUser.email === currentContact.email) {
				// PRÜFUNG: Ist der aktuelle Benutzer angemeldet?
				await this.authService.deleteAccount();
				// Danach ausloggen und zur Login-Seite
				await this.authService.logout();
			}
			// Datenbank-Eintrag löschen (passiert immer)
			await this.firebaseService.deleteItemFromCollection(
				currentContact.id,
				'contacts'
			);
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


  /**
   * Gets the initials from a full name.
   * @param fullName - The full name to convert
   * @returns The initials of the name
   */
  getInitials(fullName: string) {
    return getShortName(fullName);
  }
}
