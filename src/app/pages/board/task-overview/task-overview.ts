import {
	Component,
	inject,
	ViewChildren,
	QueryList,
	AfterViewInit,
	OnDestroy,
	signal,
	computed,
	Input,
	WritableSignal,
	ViewChild,
	ElementRef,
	NgZone
} from '@angular/core';

import { Icon } from '../../../shared/icon/icon';
import { Taskservice } from '../../../services/taskservice';
import { TaskColumn } from './task-column/task-column';
import { Task } from './task/task';
import { TaskModal } from './task/task-modal/task-modal';
import { TaskModel } from '../../../interfaces/task';
import { AddTask } from '../../add-task/add-task';

import {
	CdkDragDrop,
	CdkDrag,
	CdkDropList,
	moveItemInArray,
	transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-task-overview',
	imports: [Icon, TaskColumn, Task, CdkDropList, CdkDrag, TaskModal, AddTask],
	templateUrl: './task-overview.html',
	styleUrl: './task-overview.scss'
})
export class TaskOverview implements AfterViewInit, OnDestroy {
	taskService = inject(Taskservice);
	ngZone = inject(NgZone);

	@Input({ required: true }) priorityFilter!: WritableSignal<
		'all' | 'urgent' | 'medium' | 'low'
	>;
	@Input({ required: true }) search!: WritableSignal<string>;
	@ViewChild('overview') overview!: ElementRef<HTMLDivElement>;

	@ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
	connectedLists = signal<string[]>([]);
	isMobile = signal(window.innerWidth < 768);
	dragDelay = computed(() => (this.isMobile() ? 100 : 0));
	selectedTask = signal<TaskModel | null>(null);

	isAddTaskModalOpen = signal(false);
	selectedStatus = signal('');
	isClosing = signal(false);

	private scrollInterval: any;
	private currentScrollDirection: 'up' | 'down' | null = null;

	columns = [
		{ title: 'To do', id: 'todo', listName: 'TodoList' },
		{ title: 'In progress', id: 'progress', listName: 'ProgressList' },
		{ title: 'Await feedback', id: 'feedback', listName: 'FeedbackList' },
		{ title: 'Done', id: 'done', listName: 'DoneList' }
	];

	getTasksByStatus(status: string) {
		switch (status) {
			case 'todo':
				return this.taskService.tasksTodo();
			case 'progress':
				return this.taskService.tasksProgress();
			case 'feedback':
				return this.taskService.tasksFeedback();
			case 'done':
				return this.taskService.tasksDone();
			default:
				return [];
		}
	}

	getFilteredTasksByStatus(status: string) {
		const tasks = this.getTasksByStatus(status);
		const term = this.search().toLowerCase().trim();

		let result = tasks;
		if (term) {
			result = tasks.filter((task) =>
				task.title?.toLowerCase().includes(term) || task.description?.toLowerCase().includes(term)
			);
		}
		const filter = this.priorityFilter();

		if (filter !== 'all') {
			result = result.filter((task) => task.priority === filter);
		}

		return result;
	}

	onTaskDropped(event: CdkDragDrop<any>) {
		const targetStatus = event.container.data;
		const sourceStatus = event.previousContainer.data;

		if (sourceStatus === targetStatus) {
			const tasks = [...this.getTasksByStatus(targetStatus)];
			moveItemInArray(tasks, event.previousIndex, event.currentIndex);
			this.taskService.updateTasksOrder(tasks);
		} else {
			const sourceTasks = [...this.getTasksByStatus(sourceStatus)];
			const targetTasks = [...this.getTasksByStatus(targetStatus)];

			transferArrayItem(
				sourceTasks,
				targetTasks,
				event.previousIndex,
				event.currentIndex
			);

			this.taskService.updateTasksOrder(targetTasks, targetStatus);
			this.taskService.updateTasksOrder(sourceTasks);
		}

		this.stopAutoScroll();
	}

	openAddTaskModal(status: string) {
		this.selectedStatus.set(status);
		this.isAddTaskModalOpen.set(true);
	}

	closeAddTaskModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.isClosing.set(false);
			this.isAddTaskModalOpen.set(false);
		}, 300);
		this.selectedStatus.set('');
	}
	onDragMoved(event: any) {
		if (!this.isMobile()) return;

		const scrollThreshold = 150;
		const y = event.pointerPosition.y;
		const height = window.innerHeight;

		if (y > height - scrollThreshold) {
			this.startAutoScroll('down');
		} else if (y < scrollThreshold) {
			this.startAutoScroll('up');
		} else {
			this.stopAutoScroll();
		}
	}


	private startAutoScroll(direction: 'up' | 'down') {
		if (this.currentScrollDirection === direction) return;

		this.stopAutoScroll();
		this.currentScrollDirection = direction;

		this.ngZone.runOutsideAngular(() => {
			this.scrollInterval = setInterval(() => {
				const scrollAmount = 20; // Ridiculous speed boost
				window.scrollBy(
					0,
					direction === 'down' ? scrollAmount : -scrollAmount
				);
			}, 16);
		});
	}

	private stopAutoScroll() {
		if (this.scrollInterval) {
			clearInterval(this.scrollInterval);
			this.scrollInterval = null;
		}
		this.currentScrollDirection = null;
	}

	ngAfterViewInit() {
		this.updateConnectedLists();
		this.dropLists.changes.subscribe(() => this.updateConnectedLists());
	}

	ngOnDestroy() {
		this.stopAutoScroll();
	}

	private updateConnectedLists() {
		const ids = this.columns.map((col) => col.id);
		this.connectedLists.set(ids);
	}
}
