import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';
import { ContactModel } from '../../interfaces/contact';
import { FirebaseService } from '../../services/firebase-service';

export function getShortName(fullName: string): string {
	return fullName.split(' ').map(n => n[0]).join('');
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

	displayDetails(item: ContactModel) {
		this.selectedContactId.set(item.id);
		this.isContactVisible.set(true);
	}

	onEditContact(contact: ContactModel) {
		this.contactlist().openEditModal(contact);
	}

	onDeleteContact() {
		this.selectedContactId.set(null);
		this.isContactVisible.set(false);
	}
	
	closeDetailsView() {
		this.selectedContactId.set(null);
		this.isContactVisible.set(false);
	}

	closeSidebarIfOpen() {
		this.contactDetails()?.closeSidebar();
	}
}
