import { Component, input, output, signal } from '@angular/core';
import { TaskModel } from '../../../../../interfaces/task';
import { ContactModel } from '../../../../../interfaces/contact';

@Component({
	selector: 'app-task-modal',
	imports: [],
	templateUrl: './task-modal.html',
	styleUrl: './task-modal.scss'
})
export class TaskModal {
	task = input<TaskModel>();
	editTask = output<ContactModel>();

	close = output<void>();
	isClosing = signal(false);

	constructor() {}

	closeTaskModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}

	onEdit() {}

	onDelete() {}
}
