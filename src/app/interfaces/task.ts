import { DocumentReference } from "@angular/fire/firestore";

export interface Subtask {
	title: string;
	done: boolean;
}

export interface TaskModel {
	id: string,
	title: string,
	description: string,
	dueDate: number,
	priority: string,
	assignedTo: DocumentReference[] | null,
	category: string,
	status: string,
	subtasks: Subtask[] | null
}
