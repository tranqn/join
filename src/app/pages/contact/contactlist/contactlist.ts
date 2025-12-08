import { Component, effect, inject, signal } from '@angular/core';
import { FirebaseService } from '../../../services/firebase-service';
import { getShortName } from '../contact';
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

	constructor() {
		effect(() => {
			console.log('Contacts loaded:', this.firebaseService.contacts());
		});
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
