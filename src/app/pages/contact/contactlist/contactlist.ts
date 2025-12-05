import { Component, effect, inject } from '@angular/core';
import { FirebaseService } from '../../../services/firebase-service';

@Component({
  selector: 'app-contactlist',
  imports: [],
  templateUrl: './contactlist.html',
  styleUrl: './contactlist.scss',
})
export class Contactlist {
	firebaseService = inject(FirebaseService);

	constructor() {
		effect(() => {
			console.log('Contacts loaded:', this.firebaseService.contacts());
		});
	}
}
