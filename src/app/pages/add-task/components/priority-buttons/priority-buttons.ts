import { Component, input, output } from '@angular/core';
import { Icon } from '../../../../shared/icon/icon';

@Component({
	selector: 'app-priority-buttons',
	imports: [Icon],
	templateUrl: './priority-buttons.html',
	styleUrl: './priority-buttons.scss',
})
export class PriorityButtons {
	selectedPriority = input<string>('medium');
	prioritySelected = output<string>();

	priorities = [
		{ value: 'urgent', label: 'Urgent', icon: 'high' },
		{ value: 'medium', label: 'Medium', icon: 'medium' },
		{ value: 'low', label: 'Low', icon: 'low' }
	];

	/**
	 * Emits the selected priority value.
	 * @param value - The priority value to emit
	 */
	setPriority(value: string) {
		this.prioritySelected.emit(value);
	}
}
