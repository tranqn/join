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
import { TaskModel } from '../interfaces/task';
import { TaskModal } from '../pages/board/task-overview/task/task-modal/task-modal';

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
	async deleteItemFromCollection(docId: string, collectionName: string) {
		await deleteDoc(this.getSingleDocRef(collectionName, docId)).catch(
			(err) => {
				console.log(err);
			}
		);
	}

	/**
	 * Adds a new contact or task to Firestore.
	 * @param item - The contact or task data to add
	 */
	async addItemToCollection(item: {}, collectionName: string) {
		const contactsCollection = collection(this.firestore, collectionName);
		// Clean the item before adding (removes id field and uses appropriate model cleaning)
		const cleanedItem = this.cleanItemBeforeAdd(item, collectionName);
		await addDoc(contactsCollection, cleanedItem).catch((err) => {
			console.error(err);
		});
	}

	/**
	 * Cleans an item before adding it to Firestore.
	 * @param item - The item to clean
	 * @param collectionName - The collection name to determine item type
	 * @returns Cleaned item without id field
	 */
	private cleanItemBeforeAdd(item: any, collectionName: string): {} {
		if (collectionName === 'tasks') {
			const { id, ...rest } = item;
			return rest;
		} else if (collectionName === 'contacts') {
			const { id, ...rest } = item;
			return rest;
		}
		return item;
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
	async updateItem(item: ContactModel | TaskModel, collectionName: string) {
        if (item.id) {
            let docRef = this.getSingleDocRef(
                collectionName,
                item.id
            );
            await updateDoc(docRef, this.checkModelType(item)).catch((err) => {
                console.log(err);
            });
        }
    }

	/**
	 * Type guard to check if an item is a TaskModel.
	 * @param item - The item to check
	 * @returns True if the item is a TaskModel
	 */
	private isTaskModel(item: ContactModel | TaskModel): item is TaskModel {
		return 'title' in item && 'description' in item;
	}

	checkModelType(item: ContactModel | TaskModel): {} {
		if (this.isTaskModel(item)) {
			return this.getCleanTaskJson(item);
		} else {
			return this.getCleanContactJson(item);
		}
    }

	getCleanTaskJson(task: TaskModel): {} {
		return {
			title: task.title,
			description: task.description,
			dueDate: task.dueDate,
			priority: task.priority,
			assignedTo: task.assignedTo,
			category: task.category,
			status: task.status,
			subtasks: task.subtasks
        };
	}

	/**
	 * Converts a ContactModel to a clean JSON object for Firestore.
	 * @param contact - The contact to convert
	 * @returns A plain object with contact data
	 */
	getCleanContactJson(item: ContactModel): {} {
		return {
			name: item.name,
			email: item.email,
			phone: item.phone,
			color: item.color
		};
    }
}
