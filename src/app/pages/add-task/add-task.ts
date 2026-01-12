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

	/**
	 * Checks if the current route is the board page.
	 * @returns True if on the board route, false otherwise
	 */
	isBoardRoute(): boolean {
		return this.router.url === '/board';
	}

	/**
	 * Populates the form with task data for editing.
	 * @param task - The task to populate the form with
	 */
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

	/**
	 * Initializes the task form with validators.
	 * @returns A configured FormGroup for task data
	 */
	private initializeForm(): FormGroup {
		return this.fb.group({
			title: ['', minLengthValidator(2)],
			description: [''],
			dueDate: ['', noPastDateValidator()],
			priority: ['medium'],
			category: ['', requiredValidator()]
		});
	}

	/**
	 * Gets the error message for a form control.
	 * @param controlName - The name of the form control
	 * @returns The error message string, or empty string if no error
	 */
	getErrorMessage(controlName: string): string {
		const control = this.taskForm.get(controlName);
		if (control && control.invalid && control.touched) {
			return getErrorMessage(controlName, control.errors);
		}
		return '';
	}

	/**
	 * Handles priority selection from the priority buttons component.
	 * @param value - The selected priority value
	 */
	onPrioritySelected(value: string) {
		this.taskForm.patchValue({ priority: value });
	}

	/**
	 * Handles category selection from the category select component.
	 * @param value - The selected category value
	 */
	onCategorySelected(value: string) {
		this.taskForm.patchValue({ category: value });
	}

	/**
	 * Handles date selection from the date picker component.
	 * @param timestamp - The selected date as a timestamp
	 */
	onDateSelected(timestamp: number) {
		this.taskForm.patchValue({ dueDate: timestamp });
	}

	/**
	 * Handles changes to the assigned contacts.
	 * @param contacts - The array of selected contacts
	 */
	onContactsChanged(contacts: ContactModel[]) {
		this.selectedContacts.set(contacts);
	}

	/**
	 * Handles changes to the subtasks list.
	 * @param subtasks - The array of subtasks
	 */
	onSubtasksChanged(subtasks: Subtask[]) {
		this.subtasks.set(subtasks);
	}

	/**
	 * Handles form submission for creating or updating a task.
	 */
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

	/**
	 * Creates a new task in Firestore.
	 */
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

	/**
	 * Gets the next position for a task in the specified status column.
	 * @param status - The task status
	 * @returns The position index
	 */
	private getPositionForStatus(status: string): number {
		switch (status) {
			case 'todo': return this.taskService.tasksTodo().length;
			case 'progress': return this.taskService.tasksProgress().length;
			case 'feedback': return this.taskService.tasksFeedback().length;
			case 'done': return this.taskService.tasksDone().length;
			default: return this.taskService.tasksTodo().length;
		}
	}

	/**
	 * Updates an existing task in Firestore.
	 */
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

	/**
	 * Displays a success message toast.
	 * @param isUpdate - Whether this was an update operation (true) or create (false)
	 */
	private showSuccessMessage(isUpdate: boolean) {
		this.messageService.add({
			severity: 'success',
			summary: 'Success',
			detail: isUpdate ? 'Task updated successfully' : 'Task created successfully',
			life: 3000
		});
	}

	/**
	 * Displays an error message toast.
	 * @param isUpdate - Whether this was an update operation (true) or create (false)
	 */
	private showErrorMessage(isUpdate: boolean) {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: isUpdate ? 'Failed to update task' : 'Failed to create task',
			life: 3000
		});
	}

	/**
	 * Resets the form to its initial state.
	 */
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
