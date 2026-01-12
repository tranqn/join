import { Component, inject, input, output, signal, HostListener } from '@angular/core';
import { FirebaseService } from '../../../../services/firebase-service';
import { ContactModel } from '../../../../interfaces/contact';
import { getShortName } from '../../../contact/contact';

@Component({
	selector: 'app-contact-assignment',
	imports: [],
	templateUrl: './contact-assignment.html',
	styleUrl: './contact-assignment.scss',
})
export class ContactAssignment {
	private firebaseService = inject(FirebaseService);

	selectedContacts = input<ContactModel[]>([]);
	contactsChanged = output<ContactModel[]>();

	isOpen = signal(false);

	get contacts() {
		return this.firebaseService.contacts();
	}

	/**
	 * Toggles the contact dropdown visibility.
	 */
	toggle() {
		this.isOpen.update(open => !open);
	}

	/**
	 * Checks if a contact is currently selected.
	 * @param contact - The contact to check
	 * @returns True if the contact is selected, false otherwise
	 */
	isContactSelected(contact: ContactModel): boolean {
		return this.selectedContacts().some(c => c.id === contact.id);
	}

	/**
	 * Toggles the selection state of a contact.
	 * @param contact - The contact to toggle
	 */
	toggleContact(contact: ContactModel) {
		const current = this.selectedContacts();
		if (this.isContactSelected(contact)) {
			this.contactsChanged.emit(current.filter(c => c.id !== contact.id));
		} else {
			this.contactsChanged.emit([...current, contact]);
		}
	}

	/**
	 * Gets the initials from a contact name.
	 * @param fullName - The contact's full name
	 * @returns The initials
	 */
	getInitials(fullName: string): string {
		return getShortName(fullName);
	}

	/**
	 * Closes the dropdown when clicking outside.
	 * @param event - The mouse click event
	 */
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.contacts-wrapper')) {
			this.isOpen.set(false);
		}
	}
}
