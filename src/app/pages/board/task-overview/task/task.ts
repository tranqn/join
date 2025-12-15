import { Component, input, ChangeDetectionStrategy, signal } from '@angular/core';
import { TaskModel } from '../../../../interfaces/task';
import { TaskModal } from './task-modal/task-modal';

@Component({
	selector: 'app-task',
	imports: [TaskModal],
	templateUrl: './task.html',
	styleUrl: './task.scss',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class Task {
	task = input<TaskModel>();

	isOpen = signal(false);

	openTaskModal() {
		this.isOpen.set(true);
	}

	closeTaskModal(){
		this.isOpen.set(false);
	}
};
