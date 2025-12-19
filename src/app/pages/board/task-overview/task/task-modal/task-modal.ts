import { Component, input, output, signal, inject } from '@angular/core';
import { TaskModel } from '../../../../../interfaces/task';
import { ContactModel } from '../../../../../interfaces/contact';
import { Icon } from '../../../../../shared/icon/icon';
import { DatePipe } from '@angular/common';
import { Taskservice } from '../../../../../services/taskservice';
import { getShortName } from '../../../../contact/contact';
import { ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-task-modal',
	imports: [Icon, DatePipe, ReactiveFormsModule],
	templateUrl: './task-modal.html',
	styleUrl: './task-modal.scss'
})
export class TaskModal {
	private taskService = inject(Taskservice);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());
	
	task = input<TaskModel>();
	editTask = output<ContactModel>();
	close = output<void>();
	isEditMode = signal(false);
	isClosing = signal(false);
	priorities = signal([
		{ value: 'urgent', label: 'Urgent', icon: 'priority_high.svg' },
		{ value: 'medium', label: 'Medium', icon: 'priority_medium.svg' },
		{ value: 'low', label: 'Low', icon: 'priority_low.svg' },
	]);

	taskForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		dueDate: new FormControl('', [Validators.required]),
		priority: new FormControl('', [Validators.required]),
		assignedTo: new FormControl('', [Validators.required]),
		subtasks: new FormControl('', [Validators.required]),
	});

	constructor() {}

	setPriority(priority: string) {
		this.taskForm.get('priority')?.setValue(priority);
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

	closeTaskModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}

	onEdit() {
		this.isEditMode.set(true);
	}

	onDelete() {}

	onClose() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}
}
