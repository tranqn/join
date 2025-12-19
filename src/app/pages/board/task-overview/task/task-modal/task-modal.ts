import { Component, input, output, signal, inject } from '@angular/core';
import { TaskModel } from '../../../../../interfaces/task';
import { ContactModel } from '../../../../../interfaces/contact';
import { Icon } from '../../../../../shared/icon/icon';
import { DatePipe } from '@angular/common';
import { Taskservice } from '../../../../../services/taskservice';
import { getShortName } from '../../../../contact/contact';

@Component({
	selector: 'app-task-modal',
	imports: [Icon, DatePipe],
	templateUrl: './task-modal.html',
	styleUrl: './task-modal.scss'
})
export class TaskModal {
	private taskService = inject(Taskservice);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());
	
	task = input<TaskModel>();
	editTask = output<ContactModel>();
	close = output<void>();
	isClosing = signal(false);

	constructor() {}

	getInitials(name: string) {
		return getShortName(name);
	}

	getDoneTasks() {
		const task = this.task();
		if (!task?.subtasks || !Array.isArray(task.subtasks) || task.subtasks.length === 0) {
			return 0;
		}
		return task.subtasks.filter(subtask => subtask.done).length;
	}

	closeTaskModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}

	onEdit() {}

	onDelete() {}

	onClose() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}
}
