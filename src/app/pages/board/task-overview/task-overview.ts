import { Component } from '@angular/core';

@Component({
  selector: 'app-task-overview',
  imports: [],
  templateUrl: './task-overview.html',
  styleUrl: './task-overview.scss',
})
export class TaskOverview {
	columns = [
		{
		title: 'To do',
		id: 'todo',
		tasks: ['Login Page Design', 'Database Setup']
		},
		{
		title: 'In progress',
		id: 'progress',
		tasks: ['Contact Form']
		},
		{
		title: 'Await feedback',
		id: 'feedback',
		tasks: ['Template Review']
		},
		{
		title: 'Done',
		id: 'done',
		tasks: ['CSS Architecture Planning']
		}
  	];
}
