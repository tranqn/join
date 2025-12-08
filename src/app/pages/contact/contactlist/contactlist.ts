import { Component, computed, effect, inject, output, signal } from '@angular/core';
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

	constructor() {
		effect(() => {
			console.log('Contacts loaded:', this.firebaseService.contacts());
		});
	}

	showDetails(contact: ContactModel) {
		this.contact.emit(contact);
	}

	getInitials(fullName: string) {
		return getShortName(fullName);
	}

	openModal() {
		this.isModalOpen.set(true);
	}


	closeModal() {
		this.isModalOpen.set(false);
	}
}
