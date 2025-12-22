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

	openTaskModal() {
		this.taskClicked.emit(this.task()!);
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
