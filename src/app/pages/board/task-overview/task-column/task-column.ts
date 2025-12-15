import { Component } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-column',
  imports: [CdkDropList],
  templateUrl: './task-column.html',
  styleUrl: './task-column.scss',
})
export class TaskColumn {

}
