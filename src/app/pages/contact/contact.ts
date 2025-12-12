import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';
import { ContactModel } from '../../interfaces/contact';
import { FirebaseService } from '../../services/firebase-service';

/**
 * Generates a short name (initials) from a full name.
 * @param fullName - The full name to convert
 * @returns The initials of the name (e.g., "John Doe" becomes "JD")
 */
export function getShortName(fullName: string): string {
	return fullName.split(' ').map(n => n[0].toUpperCase()).join('');
}

@Component({
  selector: 'app-contact',
  imports: [Contactlist, ContactDetails],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
	firebaseService = inject(FirebaseService);
	
	contactlist = viewChild.required(Contactlist);
	contactDetails = viewChild(ContactDetails);

	selectedContactId = signal<string | null>(null);
	selectedContact = computed(() => {
		const id = this.selectedContactId();
		if (!id) return null;
		return this.firebaseService.contacts().find(c => c.id === id) ?? null;
	});
	isContactVisible = signal(false);

	/**
	 * Displays the details of a selected contact.
	 * @param item - The contact to display
	 */
	displayDetails(item: ContactModel) {
		this.selectedContactId.set(item.id);
		this.isContactVisible.set(true);
	}

	/**
	 * Handles the edit action for a contact.
	 * @param contact - The contact to edit
	 */
	onEditContact(contact: ContactModel) {
		this.contactlist().openEditModal(contact);
	}

	/**
	 * Handles the delete action for a contact by clearing the selection.
	 */
	onDeleteContact() {
		this.selectedContactId.set(null);
		this.isContactVisible.set(false);
	}
	
	/**
	 * Closes the contact details view.
	 */
	closeDetailsView() {
		this.selectedContactId.set(null);
		this.isContactVisible.set(false);
	}

	/**
	 * Closes the sidebar if it's currently open.
	 */
	closeSidebarIfOpen() {
		this.contactDetails()?.closeSidebar();
	}
}
