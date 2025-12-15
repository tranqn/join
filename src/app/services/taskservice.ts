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
		this.unsubTodo = this.subTasksList('to-do', this.tasksTodo);
		this.unsubProgress = this.subTasksList('progress', this.tasksProgress);
		this.unsubFeedback = this.subTasksList('feedback', this.tasksFeedback);
		this.unsubDone = this.subTasksList('done', this.tasksDone);
		effect(() => {
			console.log('To Do',this.tasksTodo());
			console.log('Progress',this.tasksProgress());
			console.log('Feedback',this.tasksFeedback());
			console.log('Done',this.tasksDone());
		})
	}

	subTasksList(status: string, array: WritableSignal<TaskModel[]>) {
      let ref = collection(doc(collection(this.firestore, "tasks"), "eTNSEOMKn9dt9XGy6m9l"), status);
      const q = query(ref, limit(100));
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
}
