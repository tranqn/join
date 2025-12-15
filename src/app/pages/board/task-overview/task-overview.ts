import { Component, inject, ViewChildren, QueryList, AfterViewInit, signal } from '@angular/core';
import { Icon } from "../../../shared/icon/icon";
import { Taskservice } from '../../../services/taskservice';
import { TaskColumn } from "./task-column/task-column";
import { Task } from "./task/task";
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';

@Component({
	selector: 'app-task-overview',
	imports: [Icon, TaskColumn, Task, CdkDropList, CdkDrag],
	templateUrl: './task-overview.html',
	styleUrl: './task-overview.scss'
})
export class TaskOverview implements AfterViewInit {
	taskService = inject(Taskservice);
	@ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
	connectedLists = signal<CdkDropList[][]>([]);

	columns = [
		{
			title: 'To do',
			id: 'todo',
			listName: 'TodoList'
		},
		{
			title: 'In progress',
			id: 'progress',
			listName: 'ProgressList'
		},
		{
			title: 'Await feedback',
			id: 'feedback',
			listName: 'FeedbackList'
		},
		{
			title: 'Done',
			id: 'done',
			listName: 'DoneList'
		}
	];

	/**
	 * Returns all drop lists except the current one (prevent self-drop)
	 */
	getConnectedLists(currentId: string) {
		return this.dropLists?.toArray().filter(list => list.data !== currentId) ?? [];
	}

	/**
	 * Returns tasks for the given column status
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
	 * Initialize connected lists after view init
	 */
	ngAfterViewInit() {
		this.updateConnectedLists();
		this.dropLists.changes.subscribe(() => this.updateConnectedLists());
	}

	/**
	 * Updates the connected lists signal
	 */
	private updateConnectedLists() {
		const allLists = this.dropLists.toArray();
		const connected = allLists.map(list =>
			allLists.filter(l => l.data !== list.data)
		);
		this.connectedLists.set(connected);
	}
}