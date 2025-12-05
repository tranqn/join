import { Component } from '@angular/core';
import { Contactlist } from './contactlist/contactlist';
import { ContactDetails } from './contact-details/contact-details';

@Component({
  selector: 'app-contact',
  imports: [Contactlist, ContactDetails],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {

}
