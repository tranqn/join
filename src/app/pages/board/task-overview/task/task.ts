import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { TaskModel } from '../../../../interfaces/task';

@Component({
  selector: 'app-task',
  imports: [],
  templateUrl: './task.html',
  styleUrl: './task.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Task {
  task = input<TaskModel>();
}
