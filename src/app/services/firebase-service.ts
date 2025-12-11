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
import { ContactModel } from '../interfaces/contact';

@Injectable({
	providedIn: 'root'
})
export class FirebaseService {
	firestore: Firestore = inject(Firestore);

	contacts = signal<ContactModel[]>([]);

	unsubContacts: () => void;

	constructor() {
		this.unsubContacts = this.subContactsList();
	}

	/**
	 * Gets the contacts collection reference from Firestore.
	 * @returns The Firestore collection reference for contacts
	 */
	getContacts() {
		return collection(this.firestore, 'contacts');
	}

	/**
	 * Subscribes to the contacts list and updates the contacts signal.
	 * @returns An unsubscribe function to stop listening to changes
	 */
	subContactsList() {
		const q = query(this.getContacts(), orderBy('name'), limit(100));
		return onSnapshot(q, (list) => {
			const contacts: ContactModel[] = [];
			list.forEach((element) => {
				contacts.push(this.setNoteObject(element.data(), element.id));
			});
			this.contacts.set(contacts);
		});
	}

	/**
	 * Converts Firestore document data to a ContactModel.
	 * @param obj - The raw Firestore document data
	 * @param id - The document ID
	 * @returns A ContactModel instance
	 */
	setNoteObject(obj: any, id: string): ContactModel {
		return {
			id: id,
			name: obj.name || '',
			email: obj.email || '',
			phone: obj.phone || '',
			color: obj.color || ''
		};
	}

	/**
	 * Deletes a contact from Firestore.
	 * @param docId - The ID of the contact document to delete
	 */
	async deleteContact(docId: string) {
		await deleteDoc(this.getSingleDocRef('contacts', docId)).catch(
			(err) => {
				console.log(err);
			}
		);
	}

	/**
	 * Adds a new contact to Firestore.
	 * @param item - The contact data to add
	 */
	async addContact(item: {}) {
		const contactsCollection = collection(this.firestore, 'contacts');
		await addDoc(contactsCollection, item).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Gets a Firestore document reference.
	 * @param colId - The collection ID
	 * @param docId - The document ID
	 * @returns A Firestore document reference
	 */
	getSingleDocRef(colId: string, docId: string) {
		return doc(collection(this.firestore, colId), docId);
	}

	/**
	 * Updates an existing contact in Firestore.
	 * @param contact - The contact with updated data
	 */
	async updateContact(contact: ContactModel) {
        if (contact.id) {
            let docRef = this.getSingleDocRef(
                "contacts",
                contact.id
            );
            await updateDoc(docRef, this.getCleanJson(contact)).catch((err) => {
                console.log(err);
            });
        }
    }

	/**
	 * Converts a ContactModel to a clean JSON object for Firestore.
	 * @param contact - The contact to convert
	 * @returns A plain object with contact data
	 */
	getCleanJson(contact: ContactModel): {} {
        return {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
			color: contact.color
        };
    }
}
