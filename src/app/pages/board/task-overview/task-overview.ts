import { Component } from '@angular/core';
import { Icon } from "../../../shared/icon/icon";

@Component({
	selector: 'app-task-overview',
	imports: [Icon],
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
