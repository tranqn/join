import { Component, input, inject, output, signal } from '@angular/core';
import { getShortName } from '../contact';
import { ContactModel } from '../../../interfaces/contact';
import { FirebaseService } from '../../../services/firebase-service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from '../../../shared/confirmation-modal/confirmation.service';
import { Icon } from "../../../shared/icon/icon";


@Component({
	selector: 'app-contact-details',
	imports: [Icon],
	templateUrl: './contact-details.html',
	styleUrl: './contact-details.scss'
})
export class ContactDetails {
	contact = input.required<ContactModel>();
	editContact = output<ContactModel>();
	deleteContact = output<void>();
	isSidebarOpen = signal(false);

	firebaseService = inject(FirebaseService);
	messageService = inject(MessageService);
	confirmationService = inject(ConfirmationService);

	contacts = this.firebaseService.contacts();

	/**
	 * Gets the initials from a full name.
	 * @param fullName - The full name to convert
	 * @returns The initials of the name
	 */
	getInitials(fullName: string) {
		return getShortName(fullName);
	}

	/**
	 * Emits an event to edit the current contact.
	 */
	onEdit() {
		this.editContact.emit(this.contact());
	}

	/**
	 * Handles the deletion of the current contact with confirmation.
	 */
	onDelete() {
		const currentContact = this.contact();

		this.confirmationService.show(
			`Are you sure you want to delete ${currentContact.name}?`,
			async () => {
				try {
					await this.firebaseService.deleteItemFromCollection(currentContact.id!, 'contacts');
					this.messageService.add({
						severity: 'success',
						summary: 'Success',
						detail: 'Contact successfully deleted',
						life: 3000
					});
					this.deleteContact.emit();
				} catch (error) {
					console.error('Error deleting contact:', error);
					this.messageService.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to delete contact',
						life: 3000
					});
				}
			}
		);
	}

	/**
	 * Toggles the visibility of the contact options sidebar.
	 */
	showContactOptions() {
		this.isSidebarOpen.update(value => !value);
	}

	/**
	 * Closes the contact options sidebar.
	 */
	closeSidebar() {
		this.isSidebarOpen.set(false);
	}
}
