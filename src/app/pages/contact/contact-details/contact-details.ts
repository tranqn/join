import { Component, input } from '@angular/core';
import { getShortName } from '../contact';
import { ContactModel } from '../../../interfaces/contact';

@Component({
  selector: 'app-contact-details',
  imports: [],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
	contact = input.required<ContactModel>();


	getInitials(fullName: string) {
		return getShortName(fullName);
	}
}
