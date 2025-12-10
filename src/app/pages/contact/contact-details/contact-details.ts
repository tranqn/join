import { Component, input, inject, output } from '@angular/core';
import { getShortName } from '../contact';
import { ContactModel } from '../../../interfaces/contact';
import { FirebaseService } from '../../../services/firebase-service';


@Component({
	selector: 'app-contact-details',
	imports: [],
	templateUrl: './contact-details.html',
	styleUrl: './contact-details.scss'
})
export class ContactDetails {
	contact = input.required<ContactModel>();
	editContact = output<ContactModel>();

	firebaseService = inject(FirebaseService);

	contacts = this.firebaseService.contacts();

	getInitials(fullName: string) {
		return getShortName(fullName);
	}

	onEdit() {
		this.editContact.emit(this.contact());
	}

	onDelete() {
		this.firebaseService.deleteContact(this.contact().id!);
	}
}
