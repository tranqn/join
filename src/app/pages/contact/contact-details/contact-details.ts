import { Component } from '@angular/core';
import { getShortName } from '../contact';

@Component({
  selector: 'app-contact-details',
  imports: [],
  templateUrl: './contact-details.html',
  styleUrl: './contact-details.scss',
})
export class ContactDetails {
	getInitials(fullName: string) {
		return getShortName(fullName);
	}
}
