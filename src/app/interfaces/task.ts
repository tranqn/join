import { DocumentReference } from "@angular/fire/firestore";
import { ContactModel } from "./contact";

export interface TaskModel {
	id: string,
	title: string,
	description: string,
	dueDate: number,
	priority: string,
	assignedTo: DocumentReference[] | null,
	category: string,
	status: string,
	subtasks: string[] | null
}
