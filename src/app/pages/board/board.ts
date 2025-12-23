import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskOverview } from "./task-overview/task-overview";
import { AddTask } from '../add-task/add-task';
import { Icon } from "../../shared/icon/icon";

@Component({
	selector: 'app-board',
	imports: [FormsModule, TaskOverview, AddTask, Icon],
	templateUrl: './board.html',
	styleUrl: './board.scss'
})
export class Board {
	search = signal('');
	isAddTaskModalOpen = signal(false);
	priorityFilter = signal<'all' | 'urgent' | 'medium' | 'low'>('all');

	togglePrioritySort() {
		const current = this.priorityFilter();

		if (current === 'all') {
			this.priorityFilter.set('urgent');
		}else if (current === 'urgent') {
			this.priorityFilter.set('medium');
		}else if (current === 'medium') {
			this.priorityFilter.set('low');
		}else {
			this.priorityFilter.set('all');
		}
		
		
		}

	openAddTaskModal() {
		this.isAddTaskModalOpen.set(true);
	}

	closeAddTaskModal() {
		this.isAddTaskModalOpen.set(false);
	}
}
