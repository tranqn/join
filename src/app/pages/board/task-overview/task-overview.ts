import { Component } from '@angular/core';

@Component({
	selector: 'app-task-overview',
	imports: [],
	templateUrl: './task-overview.html',
	styleUrl: './task-overview.scss'
})
export class TaskOverview {
	columns = [
		{
			title: 'To do',
			id: 'todo'
		},
		{
			title: 'In progress',
			id: 'progress'
		},
		{
			title: 'Await feedback',
			id: 'feedback'
		},
		{
			title: 'Done',
			id: 'done'
		}
	];
}
