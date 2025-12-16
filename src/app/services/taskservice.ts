import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
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
import { TaskModel } from '../interfaces/task';

@Injectable({
	providedIn: 'root'
})
export class Taskservice {
	firestore: Firestore = inject(Firestore);

	tasksTodo = signal<TaskModel[]>([]);
	tasksProgress = signal<TaskModel[]>([]);
	tasksFeedback = signal<TaskModel[]>([]);
	tasksDone = signal<TaskModel[]>([]);

	unsubTodo: () => void;
	unsubProgress: () => void;
	unsubFeedback: () => void;
	unsubDone: () => void;

	constructor() {
		this.unsubTodo = this.subTasksList(this.tasksTodo, 'todo');
		this.unsubProgress = this.subTasksList(this.tasksProgress, 'progress');
		this.unsubFeedback = this.subTasksList(this.tasksFeedback, 'feedback');
		this.unsubDone = this.subTasksList(this.tasksDone, 'done');
	}

	subTasksList(array: WritableSignal<TaskModel[]>, status: string) {
      let ref = (collection(this.firestore, "tasks"));
      const q = query(ref, where('status', '==', status), limit(100));
        return onSnapshot(q, (list) => {
            const tasks: TaskModel[] = [];
            list.forEach((element) => {
                tasks.push(this.setTaskObject(element.data(), element.id));
            });
            array.set(tasks);
        });
    }

	setTaskObject(obj: any, id: string): TaskModel {
		return {
			id: id,
			title: obj.title || '',
			description: obj.description || '',
			dueDate: obj.dueDate || null,
			priority: obj.priority || '',
			assignedTo: obj.assignedTo || null,
			category: obj.category || '',
			status: obj.status || '',
			subtasks: obj.subtasks || null
		};
	}

	/**
	 * Updates a task's status in Firestore
	 */
	async updateTaskStatus(taskId: string, newStatus: string) {
		const taskRef = doc(this.firestore, 'tasks', taskId);
		await updateDoc(taskRef, { status: newStatus });
	}
}
