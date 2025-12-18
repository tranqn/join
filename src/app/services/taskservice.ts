import { effect, inject, Injectable, signal, WritableSignal, Injector, runInInjectionContext } from '@angular/core';
import {
	Firestore,
	collection,
	doc,
	onSnapshot,
	updateDoc,
	query,
	limit,
	where,
	getDoc,
	writeBatch
} from '@angular/fire/firestore';
import { TaskModel } from '../interfaces/task';

@Injectable({
	providedIn: 'root'
})
export class Taskservice {
	firestore: Firestore = inject(Firestore);
	private injector = inject(Injector);

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
            tasks.sort((a, b) => a.position - b.position);
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
			position: obj.position ?? 0,
			subtasks: obj.subtasks || null
		};
	}

	/**
	 * Gets assigned contacts for a task by fetching the actual contact data from DocumentReferences
	 * @param taskSignal - Function that returns the task
	 * @returns A signal of assigned contacts
	 */
	getAssignedContacts(taskSignal: () => TaskModel | undefined) {
		const contacts = signal<any[]>([]);

		effect(() => {
			const task = taskSignal();

			if (!task?.assignedTo || !Array.isArray(task.assignedTo) || task.assignedTo.length === 0) {
				contacts.set([]);
				return;
			}

			runInInjectionContext(this.injector, () => {
				Promise.all(task.assignedTo!.map((ref) => getDoc(ref)))
					.then((docSnaps) => {
						contacts.set(docSnaps.map((snap) => snap.data()).filter(Boolean));
					})
					.catch((error) => {
						console.error('Error fetching contacts:', error);
						contacts.set([]);
					});
			});
		});

		return contacts;
	}

	/**
	 * Updates a task's status in Firestore
	 */
	async updateTaskStatus(taskId: string, newStatus: string) {
		return runInInjectionContext(this.injector, async () => {
			const taskRef = doc(this.firestore, 'tasks', taskId);
			await updateDoc(taskRef, { status: newStatus });
		});
	}

	/**
	 * Updates multiple tasks' positions and optionally status in Firestore
	 */
	async updateTasksOrder(tasks: TaskModel[], newStatus?: string) {
		return runInInjectionContext(this.injector, async () => {
			const batch = writeBatch(this.firestore);
			tasks.forEach((task, index) => {
				const taskRef = doc(this.firestore, 'tasks', task.id);
				const updates: any = { position: index };
				if (newStatus !== undefined && task.status !== newStatus) {
					updates.status = newStatus;
				}
				batch.update(taskRef, updates);
			});
			await batch.commit();
		});
	}
}
