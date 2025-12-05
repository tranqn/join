import { Component, effect, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase-service';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';

@Component({
  selector: 'app-contact',
  imports: [Contactlist, ContactDetails],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
	firebaseService = inject(FirebaseService);

	constructor() {
		effect(() => {
			console.log('Contacts loaded:', this.firebaseService.contacts());
		});
	}
}
