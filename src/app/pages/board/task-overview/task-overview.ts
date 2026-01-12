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
	NgZone,
	effect
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
	styleUrl: './task-overview.scss',
	host: {
		'(window:resize)': 'onResize()'
	}
})
export class TaskOverview implements AfterViewInit, OnDestroy {
	taskService = inject(Taskservice);
	ngZone = inject(NgZone);
	route = inject(ActivatedRoute);

	@Input({ required: true }) priorityFilter!: WritableSignal<
		'all' | 'urgent' | 'medium' | 'low'
	>;
	@Input({ required: true }) search!: WritableSignal<string>;
	@ViewChild('overview') overview!: ElementRef<HTMLDivElement>;

	@ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
	connectedLists = signal<string[]>([]);
	isMobile = signal(this.checkIsMobile());
	dragDelay = computed(() => (this.isMobile() ? 300 : 0));
	selectedTask = signal<TaskModel | null>(null);
	private urlTaskHandled = false;

	constructor() {
		effect(() => {
			if (this.urlTaskHandled) return;
			const taskId = this.route.snapshot.queryParamMap.get('taskId');
			if (!taskId || this.selectedTask()) return;

			const allTasks = [
				...this.taskService.tasksTodo(),
				...this.taskService.tasksProgress(),
				...this.taskService.tasksFeedback(),
				...this.taskService.tasksDone()
			];

			const task = allTasks.find((t) => t.id === taskId);
			if (task) {
				this.selectedTask.set(task);
				this.urlTaskHandled = true;
			}
		});
	}

	/**
	 * Checks if the current device is mobile based on window size and touch capabilities.
	 * @returns True if mobile device, false otherwise
	 */
	private checkIsMobile(): boolean {
		if (typeof window === 'undefined') return false;
		return (
			window.innerWidth < 1024 ||
			'ontouchstart' in window ||
			(navigator as any).maxTouchPoints > 0
		);
	}

	/**
	 * Handles window resize events to update mobile state.
	 */
	onResize() {
		this.isMobile.set(this.checkIsMobile());
	}

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

	/**
	 * Gets tasks for a specific status.
	 * @param status - The task status to filter by
	 * @returns Array of tasks with the specified status
	 */
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

	/**
	 * Gets filtered tasks by status, search term, and priority.
	 * @param status - The task status to filter by
	 * @returns Filtered array of tasks
	 */
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

	/**
	 * Handles task drop events for drag and drop functionality.
	 * @param event - The CDK drag drop event
	 */
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

	/**
	 * Opens the add task modal for a specific status.
	 * @param status - The status for the new task
	 */
	openAddTaskModal(status: string) {
		this.selectedStatus.set(status);
		this.isAddTaskModalOpen.set(true);
	}

	/**
	 * Closes the add task modal with animation.
	 */
	closeAddTaskModal() {
		this.isClosing.set(true);
		setTimeout(() => {
			this.isClosing.set(false);
			this.isAddTaskModalOpen.set(false);
		}, 300);
		this.selectedStatus.set('');
	}
	/**
	 * Handles drag move events to enable auto-scrolling on mobile.
	 * @param event - The drag move event
	 */
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


	/**
	 * Starts auto-scrolling in the specified direction.
	 * @param direction - The scroll direction ('up' or 'down')
	 */
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

	/**
	 * Stops the auto-scrolling functionality.
	 */
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

	/**
	 * Updates the list of connected drop lists for drag and drop.
	 */
	private updateConnectedLists() {
		const ids = this.columns.map((col) => col.id);
		this.connectedLists.set(ids);
	}
}
