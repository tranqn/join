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

	clearSubtaskInput() {
		this.subtaskInput.set('');
		this.editingSubtaskId.set(null);
	}

	startEditingSubtask(subtask: Subtask) {
		this.editingSubtaskId.set(subtask.id);
		this.editingSubtaskText.set(subtask.title);
	}

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

	deleteSubtask(id: string) {
		const updated = this.subtasks().filter(st => st.id !== id);
		this.subtasksChanged.emit(updated);
		if (this.editingSubtaskId() === id) {
			this.editingSubtaskId.set(null);
			this.editingSubtaskText.set('');
		}
	}

	toggleSubtaskComplete(id: string) {
		const updated = this.subtasks().map(st =>
			st.id === id ? { ...st, completed: !st.completed } : st
		);
		this.subtasksChanged.emit(updated);
	}
}
