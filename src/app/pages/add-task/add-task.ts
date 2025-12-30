import { Component, inject, signal, input, output, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Taskservice } from '../../services/taskservice';
import { FirebaseService } from '../../services/firebase-service';
import { ContactModel } from '../../interfaces/contact';
import { Subtask, TaskModel } from '../../interfaces/task';
import { Firestore, doc } from '@angular/fire/firestore';
import { minLengthValidator, noPastDateValidator, requiredValidator, getErrorMessage } from './task-validators';
import { PriorityButtons } from './components/priority-buttons/priority-buttons';
import { CategorySelect } from './components/category-select/category-select';
import { DatePicker } from './components/date-picker/date-picker';
import { ContactAssignment } from './components/contact-assignment/contact-assignment';
import { SubtaskManagement } from './components/subtask-management/subtask-management';

@Component({
	selector: 'app-add-task',
	imports: [
		ReactiveFormsModule,
		PriorityButtons,
		CategorySelect,
		DatePicker,
		ContactAssignment,
		SubtaskManagement
	],
	templateUrl: './add-task.html',
	styleUrl: './add-task.scss',
})
export class AddTask {
	private fb = inject(FormBuilder);
	private taskService = inject(Taskservice);
	private firebaseService = inject(FirebaseService);
	private messageService = inject(MessageService);
	private router = inject(Router);
	private firestore = inject(Firestore);

	isModal = input(false);
	taskToEdit = input<TaskModel | null | undefined>(null);
	initialStatus = input<string>('todo');
	taskCreated = output<void>();
	taskUpdated = output<void>();
	cancel = output<void>();

	taskForm: FormGroup;
	isSaving = signal(false);
	selectedContacts = signal<ContactModel[]>([]);
	subtasks = signal<Subtask[]>([]);
	currentStatus = signal<string>('todo');

	constructor() {
		this.taskForm = this.initializeForm();

		effect(() => {
			const task = this.taskToEdit();
			if (task) {
				this.populateForm(task);
			}
		});

		effect(() => {
			const status = this.initialStatus();
			if (status && !this.taskToEdit()) {
				this.currentStatus.set(status);
			}
		});
	}

	isBoardRoute(): boolean {
		return this.router.url === '/board';
	}

	private populateForm(task: TaskModel) {
		this.taskForm.patchValue({
			title: task.title,
			description: task.description,
			dueDate: task.dueDate,
			priority: task.priority,
			category: task.category === 'Technical Task' ? 'technical' : 'user-story'
		});

		if (task.assignedTo) {
			const allContacts = this.firebaseService.contacts();
			const matchedContacts = task.assignedTo
				.map(ref => allContacts.find(c => c.id === ref.id))
				.filter((c): c is ContactModel => !!c);
			this.selectedContacts.set(matchedContacts);
		} else {
			this.selectedContacts.set([]);
		}

		this.subtasks.set(task.subtasks || []);
	}

	private initializeForm(): FormGroup {
		return this.fb.group({
			title: ['', minLengthValidator(2)],
			description: [''],
			dueDate: ['', noPastDateValidator()],
			priority: ['medium'],
			category: ['', requiredValidator()]
		});
	}

	getErrorMessage(controlName: string): string {
		const control = this.taskForm.get(controlName);
		if (control && control.invalid && control.touched) {
			return getErrorMessage(controlName, control.errors);
		}
		return '';
	}

	onPrioritySelected(value: string) {
		this.taskForm.patchValue({ priority: value });
	}

	onCategorySelected(value: string) {
		this.taskForm.patchValue({ category: value });
	}

	onDateSelected(timestamp: number) {
		this.taskForm.patchValue({ dueDate: timestamp });
	}

	onContactsChanged(contacts: ContactModel[]) {
		this.selectedContacts.set(contacts);
	}

	onSubtasksChanged(subtasks: Subtask[]) {
		this.subtasks.set(subtasks);
	}

	async onSubmit() {
		if (this.taskForm.invalid || this.isSaving()) {
			this.taskForm.markAllAsTouched();
			return;
		}
		this.isSaving.set(true);
		try {
			if (this.taskToEdit()) {
				await this.updateTask();
				this.taskUpdated.emit();
			} else {
				await this.createTask();
				if (this.isModal()) {
					this.taskCreated.emit();
				} else {
					this.router.navigate(['/board']);
				}
			}
			this.showSuccessMessage(!!this.taskToEdit());
			this.clearForm();
		} catch (error) {
			console.error('Error saving task:', error);
			this.showErrorMessage(!!this.taskToEdit());
		} finally {
			this.isSaving.set(false);
		}
	}

	private async createTask() {
		const formValue = this.taskForm.value;
		const assignedToRefs = this.selectedContacts().map(contact =>
			doc(this.firestore, 'contacts', contact.id)
		);
		const status = this.currentStatus();
		const position = this.getPositionForStatus(status);
		const task = {
			title: formValue.title.trim(),
			description: formValue.description?.trim() || '',
			dueDate: new Date(formValue.dueDate).getTime(),
			priority: formValue.priority,
			category: formValue.category === 'technical' ? 'Technical Task' : 'User Story',
			status: status,
			position: position,
			assignedTo: assignedToRefs,
			subtasks: this.subtasks().length > 0 ? this.subtasks() : null
		};
		await this.firebaseService.addItemToCollection(task, 'tasks');
	}

	private getPositionForStatus(status: string): number {
		switch (status) {
			case 'todo': return this.taskService.tasksTodo().length;
			case 'progress': return this.taskService.tasksProgress().length;
			case 'feedback': return this.taskService.tasksFeedback().length;
			case 'done': return this.taskService.tasksDone().length;
			default: return this.taskService.tasksTodo().length;
		}
	}

	private async updateTask() {
		const formValue = this.taskForm.value;
		const assignedToRefs = this.selectedContacts().map(contact =>
			doc(this.firestore, 'contacts', contact.id)
		);
		const updatedTask: TaskModel = {
			...this.taskToEdit()!,
			title: formValue.title.trim(),
			description: formValue.description?.trim() || '',
			dueDate: new Date(formValue.dueDate).getTime(),
			priority: formValue.priority,
			category: formValue.category === 'technical' ? 'Technical Task' : 'User Story',
			assignedTo: assignedToRefs,
			subtasks: this.subtasks().length > 0 ? this.subtasks() : null
		};
		await this.firebaseService.updateItem(updatedTask, 'tasks');
	}

	private showSuccessMessage(isUpdate: boolean) {
		this.messageService.add({
			severity: 'success',
			summary: 'Success',
			detail: isUpdate ? 'Task updated successfully' : 'Task created successfully',
			life: 3000
		});
	}

	private showErrorMessage(isUpdate: boolean) {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: isUpdate ? 'Failed to update task' : 'Failed to create task',
			life: 3000
		});
	}

	clearForm() {
		this.taskForm.reset({
			title: '',
			description: '',
			dueDate: '',
			priority: 'medium',
			category: ''
		});
		this.selectedContacts.set([]);
		this.subtasks.set([]);
	}
}
