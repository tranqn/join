import { Component, input, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TaskModel } from '../../../../interfaces/task';
import { TaskModal } from './task-modal/task-modal';
import { Icon } from '../../../../shared/icon/icon';
import { Taskservice } from '../../../../services/taskservice';
import { getShortName } from '../../../contact/contact';

@Component({
	selector: 'app-task',
	imports: [TaskModal, Icon],
	templateUrl: './task.html',
	styleUrl: './task.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Task {
	task = input<TaskModel>();
	private taskService = inject(Taskservice);

	isOpen = signal(false);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());

	openTaskModal() {
		this.isOpen.set(true);
	}

	closeTaskModal(){
		this.isOpen.set(false);
	}

	getInitials(name: string) {
		return getShortName(name);
	}

	getDoneTasks() {
		const task = this.task();
		if (!task?.subtasks || !Array.isArray(task.subtasks) || task.subtasks.length === 0) {
			return 0;
		}
		return task.subtasks.filter(subtask => subtask.completed).length;
	}

	getProgress(length: number, done: number) {
		return `${(done / length) * 100}%`;
	}
};
