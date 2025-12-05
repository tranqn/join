import { inject, Injectable, signal } from '@angular/core';
import {
	Firestore,
	collection,
	collectionData,
	doc,
	onSnapshot,
	addDoc,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
	limit,
	where
} from '@angular/fire/firestore';
import { Contact } from '../interfaces/contact';

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	firestore: Firestore = inject(Firestore);

	contacts = signal<Contact[]>([]);

	unsubContacts: () => void;

	constructor() {
		this.unsubContacts = this.subContactsList();
	}

	getContacts() {
		return collection(this.firestore, 'contacts');
	}

	subContactsList() {
		const q = query(this.getContacts(), limit(100));
		return onSnapshot(q, (list) => {
			const contacts: Contact[] = [];
			list.forEach((element) => {
				contacts.push(this.setNoteObject(element.data(), element.id));
			});
			this.contacts.set(contacts);
		});
	}

	setNoteObject(obj: any, id: string): Contact {
		return {
			id: id,
			name: obj.name || '',
			email: obj.email || '',
			phone: obj.phone || ''
		};
	}

	async deleteContact(docId: string) {
		await deleteDoc(this.getSingleDocRef('contacts', docId)).catch(
			(err) => {
				console.log(err);
			}
		);
	}

	async addContact(item: {}) {
		const contactsCollection = collection(this.firestore, 'contacts');
		await addDoc(contactsCollection, item).catch((err) => {
			console.error(err);
		});
	}

	getSingleDocRef(colId: string, docId: string) {
		return doc(collection(this.firestore, colId), docId);
	}

	async updateContact(contact: Contact) {
        if (contact.id) {
            let docRef = this.getSingleDocRef(
                "contact",
                contact.id
            );
            await updateDoc(docRef, this.getCleanJson(contact)).catch((err) => {
                console.log(err);
            });
        }
    }

	getCleanJson(contact: Contact): {} {
        return {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
        };
    }
}
