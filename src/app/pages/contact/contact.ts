import { Component, effect, inject } from '@angular/core';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';

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
	displayDetails(item: {}) {
		console.log(item);
		
	}
}
