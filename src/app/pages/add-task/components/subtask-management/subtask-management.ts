import { Component, input, output, signal } from '@angular/core';
import { Subtask } from '../../../../interfaces/task';

@Component({
	selector: 'app-subtask-management',
	imports: [],
	templateUrl: './subtask-management.html',
	styleUrl: './subtask-management.scss',
})
export class SubtaskManagement {
	subtasks = input<Subtask[]>([]);
	subtasksChanged = output<Subtask[]>();

	subtaskInput = signal('');
	editingSubtaskId = signal<string | null>(null);
	editingSubtaskText = signal('');

	/**
	 * Adds a new subtask or updates an existing one if in edit mode.
	 */
	addSubtask() {
		const title = this.subtaskInput().trim();
		if (!title) return;

		const editingId = this.editingSubtaskId();
		if (editingId) {
			const updated = this.subtasks().map(st =>
				st.id === editingId ? { ...st, title } : st
			);
			this.subtasksChanged.emit(updated);
			this.editingSubtaskId.set(null);
		} else {
			const newSubtask: Subtask = {
				id: crypto.randomUUID(),
				title,
				completed: false
			};
			this.subtasksChanged.emit([...this.subtasks(), newSubtask]);
		}
		this.subtaskInput.set('');
	}

	/**
	 * Clears the subtask input field and exits edit mode.
	 */
	clearSubtaskInput() {
		this.subtaskInput.set('');
		this.editingSubtaskId.set(null);
	}

	/**
	 * Enters edit mode for a subtask.
	 * @param subtask - The subtask to edit
	 */
	startEditingSubtask(subtask: Subtask) {
		this.editingSubtaskId.set(subtask.id);
		this.editingSubtaskText.set(subtask.title);
	}

	/**
	 * Saves the edited subtask and exits edit mode.
	 */
	saveEditingSubtask() {
		const editingId = this.editingSubtaskId();
		const newTitle = this.editingSubtaskText().trim();

		if (!editingId || !newTitle) {
			this.editingSubtaskId.set(null);
			this.editingSubtaskText.set('');
			return;
		}

		const updated = this.subtasks().map(st =>
			st.id === editingId ? { ...st, title: newTitle } : st
		);
		this.subtasksChanged.emit(updated);
		this.editingSubtaskId.set(null);
		this.editingSubtaskText.set('');
	}

	/**
	 * Deletes a subtask by ID.
	 * @param id - The ID of the subtask to delete
	 */
	deleteSubtask(id: string) {
		const updated = this.subtasks().filter(st => st.id !== id);
		this.subtasksChanged.emit(updated);
		if (this.editingSubtaskId() === id) {
			this.editingSubtaskId.set(null);
			this.editingSubtaskText.set('');
		}
	}

	/**
	 * Toggles the completion status of a subtask.
	 * @param id - The ID of the subtask to toggle
	 */
	toggleSubtaskComplete(id: string) {
		const updated = this.subtasks().map(st =>
			st.id === id ? { ...st, completed: !st.completed } : st
		);
		this.subtasksChanged.emit(updated);
	}
}
