import { Component, inject, input, output, signal, HostListener } from '@angular/core';
import { FirebaseService } from '../../../../services/firebase-service';
import { ContactModel } from '../../../../interfaces/contact';

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

	toggle() {
		this.isOpen.update(open => !open);
	}

	isContactSelected(contact: ContactModel): boolean {
		return this.selectedContacts().some(c => c.id === contact.id);
	}

	toggleContact(contact: ContactModel) {
		const current = this.selectedContacts();
		if (this.isContactSelected(contact)) {
			this.contactsChanged.emit(current.filter(c => c.id !== contact.id));
		} else {
			this.contactsChanged.emit([...current, contact]);
		}
	}

	getInitials(fullName: string): string {
		return fullName.split(' ').map(n => n[0]?.toUpperCase() || '').join('');
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.contacts-wrapper')) {
			this.isOpen.set(false);
		}
	}
}
