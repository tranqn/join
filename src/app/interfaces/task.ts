import { Contact } from "../pages/contact/contact";

export interface TaskModel {
	id: string,
	title: string,
	description: string,
	dueDate: number,
	priority: string,
	assignedTo: Contact[],
	category: string,
	status: string,
	subtasks: string[] | null
}
