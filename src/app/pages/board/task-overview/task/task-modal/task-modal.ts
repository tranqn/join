import { Component, input, output, signal } from '@angular/core';
import { TaskModel } from '../../../../../interfaces/task';
import { ContactModel } from '../../../../../interfaces/contact';
import { Icon } from '../../../../../shared/icon/icon';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-task-modal',
	imports: [Icon, DatePipe],
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

	onClose() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}
}
