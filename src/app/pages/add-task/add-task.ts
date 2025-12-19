import { Component, inject, signal, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Taskservice } from '../../services/taskservice';
import { FirebaseService } from '../../services/firebase-service';
import { ContactModel } from '../../interfaces/contact';
import { Subtask } from '../../interfaces/task';
import { Firestore, doc } from '@angular/fire/firestore';
import { Icon } from '../../shared/icon/icon';
import { minLengthValidator, noPastDateValidator, requiredValidator, getErrorMessage } from './task-validators';

@Component({
	selector: 'app-add-task',
	imports: [ReactiveFormsModule, Icon],
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

	taskForm: FormGroup;
	isSaving = signal(false);
	isContactsOpen = signal(false);
	isCategoryOpen = signal(false);
	isDatePickerOpen = signal(false);
	selectedContacts = signal<ContactModel[]>([]);

	// Date picker state
	viewDate = new Date();

	// Subtask state
	subtasks = signal<Subtask[]>([]);
	subtaskInput = signal('');
	editingSubtaskId = signal<string | null>(null);

	priorities = [
		{ value: 'urgent', label: 'Urgent', icon: 'high' },
		{ value: 'medium', label: 'Medium', icon: 'medium' },
		{ value: 'low', label: 'Low', icon: 'low' }
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
	 * Toggles date picker dropdown
	 */
	toggleDatePicker() {
		this.isDatePickerOpen.update(open => !open);
		if (this.isDatePickerOpen()) {
			this.isContactsOpen.set(false);
			this.isCategoryOpen.set(false);
		}
	}

	/**
	 * Formats date for display
	 */
	formatDate(value: number | null): string {
		if (!value) return 'dd/mm/yyyy';
		const date = new Date(value);
		const day = String(date.getDate()).padStart(2, '0');
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	}

	/**
	 * Gets current month/year for header
	 */
	getMonthYear(): string {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		return `${months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
	}

	/**
	 * Navigate to previous month
	 */
	prevMonth() {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
	}

	/**
	 * Navigate to next month
	 */
	nextMonth() {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
	}

	/**
	 * Generates calendar days for current view
	 */
	getCalendarDays(): { num: number; date: Date; current: boolean; selected: boolean; today: boolean; past: boolean }[] {
		const days = [];
		const year = this.viewDate.getFullYear();
		const month = this.viewDate.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const selectedValue = this.taskForm.get('dueDate')?.value;

		// Previous month days
		for (let i = firstDay - 1; i >= 0; i--) {
			const date = new Date(year, month - 1, daysInPrevMonth - i);
			days.push({ num: daysInPrevMonth - i, date, current: false, selected: false, today: false, past: date < today });
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(year, month, i);
			const isToday = date.getTime() === today.getTime();
			const isSelected = selectedValue && new Date(selectedValue).toDateString() === date.toDateString();
			days.push({ num: i, date, current: true, selected: isSelected, today: isToday, past: date < today });
		}

		// Next month days
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const date = new Date(year, month + 1, i);
			days.push({ num: i, date, current: false, selected: false, today: false, past: false });
		}

		return days;
	}

	/**
	 * Selects a date and closes picker
	 */
	selectDate(date: Date) {
		this.taskForm.patchValue({ dueDate: date.getTime() });
		this.isDatePickerOpen.set(false);
	}

	/**
	 * Adds a new subtask or updates an existing one
	 */
	addSubtask() {
		const title = this.subtaskInput().trim();
		if (!title) return;

		const editingId = this.editingSubtaskId();
		if (editingId) {
			// Update existing subtask
			this.subtasks.update(list =>
				list.map(st => st.id === editingId ? { ...st, title } : st)
			);
			this.editingSubtaskId.set(null);
		} else {
			// Add new subtask
			const newSubtask: Subtask = {
				id: crypto.randomUUID(),
				title,
				completed: false
			};
			this.subtasks.update(list => [...list, newSubtask]);
		}
		this.subtaskInput.set('');
	}

	/**
	 * Clears the subtask input
	 */
	clearSubtaskInput() {
		this.subtaskInput.set('');
		this.editingSubtaskId.set(null);
	}

	/**
	 * Starts editing a subtask
	 */
	editSubtask(subtask: Subtask) {
		this.subtaskInput.set(subtask.title);
		this.editingSubtaskId.set(subtask.id);
	}

	/**
	 * Deletes a subtask
	 */
	deleteSubtask(id: string) {
		this.subtasks.update(list => list.filter(st => st.id !== id));
		if (this.editingSubtaskId() === id) {
			this.clearSubtaskInput();
		}
	}

	/**
	 * Toggles subtask completion
	 */
	toggleSubtaskComplete(id: string) {
		this.subtasks.update(list =>
			list.map(st => st.id === id ? { ...st, completed: !st.completed } : st)
		);
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
		if (!target.closest('.date-picker')) {
			this.isDatePickerOpen.set(false);
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
		const assignedToRefs = this.selectedContacts().map(contact =>
			doc(this.firestore, 'contacts', contact.id)
		);
		const task = {
			title: formValue.title.trim(),
			description: formValue.description?.trim() || '',
			dueDate: new Date(formValue.dueDate).getTime(),
			priority: formValue.priority,
			category: formValue.category === 'technical' ? 'Technical Task' : 'User Story',
			status: 'todo',
			position: this.taskService.tasksTodo().length,
			assignedTo: assignedToRefs,
			subtasks: this.subtasks().length > 0 ? this.subtasks() : null
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
		this.subtasks.set([]);
		this.subtaskInput.set('');
		this.editingSubtaskId.set(null);
	}
}
