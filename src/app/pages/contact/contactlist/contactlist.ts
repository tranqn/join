import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FirebaseService } from '../../../services/firebase-service';
import { getShortName } from '../contact';
import { ContactModel } from '../../../interfaces/contact';
import { ContactModal } from '../contact-modal/contact-modal';

@Component({
  selector: 'app-contactlist',
  imports: [ContactModal],
  templateUrl: './contactlist.html',
  styleUrl: './contactlist.scss',
})
export class Contactlist {
	firebaseService = inject(FirebaseService);

	contacts = this.firebaseService.contacts();
	isModalOpen = signal(false);
	contactToEdit = signal<ContactModel | null>(null);
	selectedContact = input<ContactModel | null>(null);

	contact = output<ContactModel>();

	groupedContacts = computed(() => {
		const contacts = this.firebaseService.contacts();
		const groups = new Map<string, typeof contacts>();
		
		contacts.forEach(contact => {
			const firstLetter = contact.name.charAt(0).toUpperCase();
			if (!groups.has(firstLetter)) {
				groups.set(firstLetter, []);
			}
			groups.get(firstLetter)!.push(contact);
		});
		
		return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
	});

	/**
	 * Emits an event to show the details of a contact.
	 * @param contact - The contact to show details for
	 */
	showDetails(contact: ContactModel) {
		this.contact.emit(contact);
	}

	/**
	 * Gets the initials from a full name.
	 * @param fullName - The full name to convert
	 * @returns The initials of the name
	 */
	getInitials(fullName: string) {
		return getShortName(fullName);
	}

	/**
	 * Opens the modal for creating a new contact.
	 */
	openCreateModal() {
		this.contactToEdit.set(null);
		this.isModalOpen.set(true);
	}

	/**
	 * Opens the modal for editing an existing contact.
	 * @param contact - The contact to edit
	 */
	openEditModal(contact: ContactModel) {
		this.contactToEdit.set(contact);
		this.isModalOpen.set(true);
	}

	/**
	 * Closes the contact modal and clears the contact being edited.
	 */
	closeModal() {
		this.isModalOpen.set(false);
		this.contactToEdit.set(null);
	}
}
