import { Component, input, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { TaskModel } from '../../../../interfaces/task';
import { Icon } from '../../../../shared/icon/icon';
import { Taskservice } from '../../../../services/taskservice';
import { getShortName } from '../../../contact/contact';

@Component({
	selector: 'app-task',
	imports: [Icon],
	templateUrl: './task.html',
	styleUrl: './task.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Task {
	task = input<TaskModel>();
	taskClicked = output<TaskModel>();
	private taskService = inject(Taskservice);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());

	/**
	 * Emits an event to open the task modal with this task's details.
	 */
	openTaskModal() {
		this.taskClicked.emit(this.task()!);
	}

	/**
	 * Gets the initials from a contact name.
	 * @param name - The contact's full name
	 * @returns The initials
	 */
	getInitials(name: string) {
		return getShortName(name);
	}

	/**
	 * Gets the count of completed subtasks.
	 * @returns The number of completed subtasks
	 */
	getDoneTasks() {
		const task = this.task();
		if (!task?.subtasks || !Array.isArray(task.subtasks) || task.subtasks.length === 0) {
			return 0;
		}
		return task.subtasks.filter(subtask => subtask.completed).length;
	}

	/**
	 * Calculates the progress percentage for subtasks.
	 * @param length - Total number of subtasks
	 * @param done - Number of completed subtasks
	 * @returns The progress percentage as a string
	 */
	getProgress(length: number, done: number) {
		return `${(done / length) * 100}%`;
	}
};
