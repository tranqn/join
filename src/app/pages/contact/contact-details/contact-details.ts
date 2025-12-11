import { Component, input, inject, output, signal } from '@angular/core';
import { getShortName } from '../contact';
import { ContactModel } from '../../../interfaces/contact';
import { FirebaseService } from '../../../services/firebase-service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from '../../../shared/confirmation-modal/confirmation.service';


@Component({
	selector: 'app-contact-details',
	imports: [],
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

	getInitials(fullName: string) {
		return getShortName(fullName);
	}

	onEdit() {
		this.editContact.emit(this.contact());
	}

	onDelete() {
		const currentContact = this.contact();

		this.confirmationService.show(
			`Are you sure you want to delete ${currentContact.name}?`,
			async () => {
				try {
					await this.firebaseService.deleteContact(currentContact.id!);
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

	showContactOptions() {
		this.isSidebarOpen.update(value => !value);
	}

	closeSidebar() {
		this.isSidebarOpen.set(false);
	}
}
