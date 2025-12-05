import { Component, effect, inject } from '@angular/core';
import { FirebaseService } from '../../../services/firebase-service';
import { getShortName } from '../contact';

@Component({
  selector: 'app-contactlist',
  imports: [],
  templateUrl: './contactlist.html',
  styleUrl: './contactlist.scss',
})
export class Contactlist {
	firebaseService = inject(FirebaseService);

	contacts = this.firebaseService.contacts();

	constructor() {
		effect(() => {
			console.log('Contacts loaded:', this.firebaseService.contacts());
		});
	}

	getInitials(fullName: string) {
		return getShortName(fullName);
	}
}
