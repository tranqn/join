import { Component, input, inject, output, signal } from '@angular/core';
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
	deleteContact = output<void>();
	deleteModalOpen = signal(false);
	isSidebarOpen = signal(false);

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
		this.deleteContact.emit();
	}

	openDeleteModal() {
		this.deleteModalOpen.set(true);
	}
	
	closeDeleteModal() {
		this.deleteModalOpen.set(false);
	}

	showContactOptions() {
		this.isSidebarOpen.update(value => !value);
	}

	closeSidebar() {
		this.isSidebarOpen.set(false);
	}
}
