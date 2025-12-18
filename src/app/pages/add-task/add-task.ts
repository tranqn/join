import { Component, inject, signal, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Taskservice } from '../../services/taskservice';
import { FirebaseService } from '../../services/firebase-service';
import { ContactModel } from '../../interfaces/contact';
import { minLengthValidator, noPastDateValidator, requiredValidator, getErrorMessage } from './task-validators';

@Component({
	selector: 'app-add-task',
	imports: [ReactiveFormsModule],
	templateUrl: './add-task.html',
	styleUrl: './add-task.scss',
})
export class AddTask {
	private fb = inject(FormBuilder);
	private taskService = inject(Taskservice);
	private firebaseService = inject(FirebaseService);
	private messageService = inject(MessageService);
	private router = inject(Router);

	taskForm: FormGroup;
	isSaving = signal(false);
	isContactsOpen = signal(false);
	isCategoryOpen = signal(false);
	selectedContacts = signal<ContactModel[]>([]);

	priorities = [
		{ value: 'urgent', label: 'Urgent', icon: 'icons/prio-alta.svg' },
		{ value: 'medium', label: 'Medium', icon: 'icons/prio-media.svg' },
		{ value: 'low', label: 'Low', icon: 'icons/prio-baja.svg' }
	];

	categories = [
		{ value: 'technical', label: 'Technical Task' },
		{ value: 'user-story', label: 'User Story' }
	];

	constructor() {
		this.taskForm = this.initializeForm();
	}

	/**
	 * Gets available contacts from FirebaseService
	 */
	get contacts() {
		return this.firebaseService.contacts();
	}

	/**
	 * Initializes the task form with validators
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
	 * Returns today's date in YYYY-MM-DD format for min date
	 */
	getMinDate(): string {
		const today = new Date();
		return today.toISOString().split('T')[0];
	}

	/**
	 * Toggles contact dropdown visibility
	 */
	toggleContacts() {
		this.isContactsOpen.update(open => !open);
		if (this.isContactsOpen()) {
			this.isCategoryOpen.set(false);
		}
	}

	/**
	 * Toggles category dropdown visibility
	 */
	toggleCategory() {
		this.isCategoryOpen.update(open => !open);
		if (this.isCategoryOpen()) {
			this.isContactsOpen.set(false);
		}
	}

	/**
	 * Checks if a contact is selected
	 */
	isContactSelected(contact: ContactModel): boolean {
		return this.selectedContacts().some(c => c.id === contact.id);
	}

	/**
	 * Toggles a contact selection
	 */
	toggleContact(contact: ContactModel) {
		if (this.isContactSelected(contact)) {
			this.selectedContacts.update(list => list.filter(c => c.id !== contact.id));
		} else {
			this.selectedContacts.update(list => [...list, contact]);
		}
	}

	/**
	 * Selects a category and closes dropdown
	 */
	selectCategory(value: string) {
		this.taskForm.patchValue({ category: value });
		this.isCategoryOpen.set(false);
	}

	/**
	 * Gets the selected category label
	 */
	getSelectedCategoryLabel(): string {
		const value = this.taskForm.get('category')?.value;
		const category = this.categories.find(c => c.value === value);
		return category?.label || 'Select task category';
	}

	/**
	 * Sets the priority value
	 */
	setPriority(value: string) {
		this.taskForm.patchValue({ priority: value });
	}

	/**
	 * Gets initials from a full name
	 */
	getInitials(fullName: string): string {
		return fullName.split(' ').map(n => n[0]?.toUpperCase() || '').join('');
	}

	/**
	 * Gets error message for a form control
	 */
	getErrorMessage(controlName: string): string {
		const control = this.taskForm.get(controlName);
		if (control && control.invalid && control.touched) {
			return getErrorMessage(controlName, control.errors);
		}
		return '';
	}

	/**
	 * Closes dropdowns when clicking outside
	 */
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.contacts-dropdown') && !target.closest('.contacts-trigger')) {
			this.isContactsOpen.set(false);
		}
		if (!target.closest('.category-dropdown') && !target.closest('.category-trigger')) {
			this.isCategoryOpen.set(false);
		}
	}

	/**
	 * Handles form submission
	 */
	async onSubmit() {
		if (this.taskForm.invalid || this.isSaving()) {
			this.taskForm.markAllAsTouched();
			return;
		}
		this.isSaving.set(true);
		try {
			await this.createTask();
			this.showSuccessMessage();
			this.clearForm();
			this.router.navigate(['/board']);
		} catch (error) {
			console.error('Error creating task:', error);
			this.showErrorMessage();
		} finally {
			this.isSaving.set(false);
		}
	}

	/**
	 * Creates the task in Firestore
	 */
	private async createTask() {
		const formValue = this.taskForm.value;
		const task = {
			title: formValue.title.trim(),
			description: formValue.description?.trim() || '',
			dueDate: new Date(formValue.dueDate).getTime(),
			priority: formValue.priority,
			category: formValue.category === 'technical' ? 'Technical Task' : 'User Story',
			status: 'todo',
			assignedTo: this.selectedContacts(),
			subtasks: null
		};
		await this.firebaseService.addItemToCollection(task, 'tasks');
	}

	/**
	 * Shows success toast message
	 */
	private showSuccessMessage() {
		this.messageService.add({
			severity: 'success',
			summary: 'Success',
			detail: 'Task created successfully',
			life: 3000
		});
	}

	/**
	 * Shows error toast message
	 */
	private showErrorMessage() {
		this.messageService.add({
			severity: 'error',
			summary: 'Error',
			detail: 'Failed to create task',
			life: 3000
		});
	}

	/**
	 * Clears the form and resets selections
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
	}
}
