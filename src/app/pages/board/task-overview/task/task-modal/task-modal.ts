import { TaskModel } from '../../../../../interfaces/task';
import { DatePipe } from '@angular/common';
import { getShortName } from '../../../../contact/contact';
import {
	Component,
	inject,
	signal,
	HostListener,
	Input,
	Output,
	EventEmitter,
	input,
	output
} from '@angular/core';
import {
	FormBuilder,
	FormGroup,
	ReactiveFormsModule,
	FormControl,
	Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Taskservice } from '../../../../../services/taskservice';
import { FirebaseService } from '../../../../../services/firebase-service';
import { ContactModel } from '../../../../../interfaces/contact';
import { Subtask } from '../../../../../interfaces/task';
import { Firestore, doc } from '@angular/fire/firestore';
import { Icon } from '../../../../../shared/icon/icon';
import {
	minLengthValidator,
	noPastDateValidator,
	requiredValidator,
	getErrorMessage
} from './../../../../add-task/task-validators';
import { AddTask } from './../../../../add-task/add-task';

@Component({
	selector: 'app-task-modal',
	imports: [Icon, DatePipe, ReactiveFormsModule],
	templateUrl: './task-modal.html',
	styleUrl: './task-modal.scss'
})
export class TaskModal {
	private taskService = inject(Taskservice);
	private firebaseService = inject(FirebaseService);

	assignedContacts = this.taskService.getAssignedContacts(() => this.task());

	task = input<TaskModel>();
	editTask = output<ContactModel>();
	close = output<void>();
	isEditMode = signal(false);
	isClosing = signal(false);
	isSaving = signal(false);
	isContactsOpen = signal(false);
	isCategoryOpen = signal(false);
	isDatePickerOpen = signal(false);
	selectedContacts = signal<ContactModel[]>([]);

	// Subtask state
	subtasks = signal<Subtask[]>([]);
	subtaskInput = signal('');
	editingSubtaskId = signal<string | null>(null);

	priorities = signal([
		{ value: 'urgent', label: 'Urgent', icon: 'high' },
		{ value: 'medium', label: 'Medium', icon: 'medium' },
		{ value: 'low', label: 'Low', icon: 'low' }
	]);

	taskForm = new FormGroup({
		title: new FormControl('', [Validators.required]),
		description: new FormControl(''),
		dueDate: new FormControl<string | number | null>(null, [Validators.required]),
		priority: new FormControl('medium'),
		assignedTo: new FormControl(''),
		subtasks: new FormControl('')
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
		if (
			!task?.subtasks ||
			!Array.isArray(task.subtasks) ||
			task.subtasks.length === 0
		) {
			return 0;
		}
		return task.subtasks.filter((subtask) => subtask.completed).length;
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
		
		// Initialize form with current task values
		const task = this.task();
		if (task) {
			this.taskForm.patchValue({
				title: task.title || '',
				description: task.description || '',
				dueDate: task.dueDate || '',
				priority: task.priority || 'medium'
			});
			
			// Initialize selectedContacts with already assigned contacts
			// Match with contacts from FirebaseService to get proper IDs
			const assigned = this.assignedContacts();
			if (assigned && assigned.length > 0) {
				const allContacts = this.contacts;
				const matchedContacts = assigned
					.map(a => allContacts.find(c => c.name === a.name && c.email === a.email))
					.filter((c): c is ContactModel => c !== undefined);
				this.selectedContacts.set(matchedContacts);
			}
			
			// Initialize subtasks if present
			if (task.subtasks && Array.isArray(task.subtasks)) {
				this.subtasks.set(task.subtasks.map(st => ({
					id: st.id || crypto.randomUUID(),
					title: st.title,
					completed: st.completed || false
				})));
			}
		}
	}

	onDelete() {}

	onClose() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.close.emit();
			this.isClosing.set(false);
		}, 300);
	}

	/**
     
Gets error message for a form control*/
	getErrorMessage(controlName: string): string {
		const control = this.taskForm.get(controlName);
		if (control && control.invalid && control.touched) {
			return getErrorMessage(controlName, control.errors);
		}
		return '';
	}

	toggleDatePicker() {
		this.isDatePickerOpen.update((open) => !open);
		if (this.isDatePickerOpen()) {
			this.isContactsOpen.set(false);
			this.isCategoryOpen.set(false);
		}
	}

	/**
	 * Gets available contacts from FirebaseService
	 */
	get contacts() {
		return this.firebaseService.contacts();
	}

	/**
	 * Toggles contact dropdown visibility
	 */
	toggleContacts() {
		this.isContactsOpen.update(open => !open);
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
	 * Adds a new subtask or updates an existing one
	 */
	addSubtask() {
		const title = this.subtaskInput().trim();
		if (!title) return;

		const editingId = this.editingSubtaskId();
		if (editingId) {
			this.subtasks.update(list =>
				list.map(st => st.id === editingId ? { ...st, title } : st)
			);
			this.editingSubtaskId.set(null);
		} else {
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

	// Date picker state
	viewDate = new Date();

	/**
	 * Formats date for display
	 */
	formatDate(value: string | number | null | undefined): string {
		if (!value || value === '') return 'dd/mm/yyyy';
		const date = new Date(value);
		// Check if date is valid
		if (isNaN(date.getTime())) return 'dd/mm/yyyy';
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
			const isSelected = !!(selectedValue && new Date(selectedValue).toDateString() === date.toDateString());
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
	 * Saves the updated task
	 */
	async onSave() {
		if (this.taskForm.invalid) {
			this.taskForm.markAllAsTouched();
			return;
		}
		
		const currentTask = this.task();
		if (!currentTask) return;
		
		this.isSaving.set(true);
		
		try {
			// Convert selected contacts to DocumentReferences (filter out any without valid IDs)
			const assignedToRefs = this.selectedContacts()
				.filter(contact => contact && contact.id)
				.map(contact => doc(this.firebaseService.firestore, 'contacts', contact.id));
			
			// Build the updated task object
			const updatedTask: TaskModel = {
				id: currentTask.id,
				title: this.taskForm.get('title')?.value || '',
				description: this.taskForm.get('description')?.value || '',
				dueDate: Number(this.taskForm.get('dueDate')?.value) || currentTask.dueDate,
				priority: this.taskForm.get('priority')?.value || 'medium',
				assignedTo: assignedToRefs.length > 0 ? assignedToRefs : null,
				category: currentTask.category,
				status: currentTask.status,
				position: currentTask.position,
				subtasks: this.subtasks().length > 0 ? this.subtasks() : null
			};
			
			// Save to Firestore
			await this.firebaseService.updateItem(updatedTask, 'tasks');
			
			// Close the edit mode
			this.isEditMode.set(false);
		} catch (error) {
			console.error('Error saving task:', error);
		} finally {
			this.isSaving.set(false);
		}
	}
}
