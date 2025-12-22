import { TaskModel } from '../../../../../interfaces/task';
import { DatePipe } from '@angular/common';
import { getShortName } from '../../../../contact/contact';
import {
	Component,
	inject,
	signal,
	input,
	output
} from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Taskservice } from '../../../../../services/taskservice';
import { FirebaseService } from '../../../../../services/firebase-service';
import { ContactModel } from '../../../../../interfaces/contact';
import { Icon } from '../../../../../shared/icon/icon';
import { AddTask } from './../../../../add-task/add-task';
import { ConfirmationService } from '../../../../../shared/confirmation-modal/confirmation.service';

@Component({
	selector: 'app-task-modal',
	imports: [Icon, DatePipe, AddTask],
	templateUrl: './task-modal.html',
	styleUrl: './task-modal.scss'
})
export class TaskModal {
	private taskService = inject(Taskservice);
	private firebaseService = inject(FirebaseService);
	private confirmationService = inject(ConfirmationService);
	private messageService = inject(MessageService);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());

	task = input.required<TaskModel>();
	close = output<void>();
	isEditMode = signal(false);
	isClosing = signal(false);

	constructor() {}

	getInitials(name: string) {
		return getShortName(name);
	}

	getDoneTasks() {
		const task = this.task();
		if (
			!task?.subtasks ||
			!Array.isArray(task.subtasks) ||
			task.subtasks.length === 0
		) {
			return 0;
		}
		return task.subtasks.filter((subtask) => subtask.completed).length;
	}

	onEdit() {
		this.isEditMode.set(true);
	}

	onDelete() {
		const currentTask = this.task();
		if (!currentTask) return;

		this.confirmationService.show(
			`Are you sure you want to delete "${currentTask.title}"?`,
			async () => {
				try {
					await this.firebaseService.deleteItemFromCollection(
						currentTask.id!,
						`tasks`
					);
					this.messageService.add({
						severity: `success`,
						summary: `success`,
						detail: `Task successfully deleted`,
						life: 3000
					});
					this.close.emit();
				} catch (error) {
					console.error(`Error deleting task:`, error);
					this.messageService.add({
						severity: `error`,
						summary: `Error`,
						detail: `Failed to delete task`,
						life: 3000
					});
				}
			}
		);
	}

	onClose() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}
}
