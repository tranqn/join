import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';
import { ContactModel } from '../../interfaces/contact';

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
	contactlist = viewChild.required(Contactlist);

	selectedContact = signal<ContactModel | null>(null);
	isContactVisible = signal(false);

	displayDetails(item: ContactModel) {
		this.selectedContact.set(item);
		this.isContactVisible.set(true);
	}

	showContactOptions() {

	}

	onEditContact(contact: ContactModel) {
		this.contactlist().openEditModal(contact);
	}
}
