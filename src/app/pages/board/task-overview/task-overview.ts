import {
  Component,
  inject,
  ViewChildren,
  QueryList,
  AfterViewInit,
  signal,
  Input,
  WritableSignal
} from '@angular/core';

import { Icon } from "../../../shared/icon/icon";
import { Taskservice } from '../../../services/taskservice';
import { TaskColumn } from "./task-column/task-column";
import { Task } from "./task/task";

import {
  CdkDragDrop,
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

  // 🔹 Search kommt als SIGNAL rein
  @Input({ required: true }) search!: WritableSignal<string>;

  @ViewChildren(CdkDropList) dropLists!: QueryList<CdkDropList>;
  connectedLists = signal<CdkDropList[][]>([]);

  columns = [
    { title: 'To do', id: 'todo', listName: 'TodoList' },
    { title: 'In progress', id: 'progress', listName: 'ProgressList' },
    { title: 'Await feedback', id: 'feedback', listName: 'FeedbackList' },
    { title: 'Done', id: 'done', listName: 'DoneList' }
  ];

  getTasksByStatus(status: string) {
    switch (status) {
      case 'todo': return this.taskService.tasksTodo();
      case 'progress': return this.taskService.tasksProgress();
      case 'feedback': return this.taskService.tasksFeedback();
      case 'done': return this.taskService.tasksDone();
      default: return [];
    }
  }

  // ✅ RICHTIGE FILTERLOGIK MIT SIGNAL
  getFilteredTasksByStatus(status: string) {
    const tasks = this.getTasksByStatus(status);
    const term = this.search().toLowerCase().trim();

    if (!term) {
      return tasks;
    }

    return tasks.filter(task =>
      task.title?.toLowerCase().includes(term)
    );
  }

  onTaskDropped(event: CdkDragDrop<any>, targetStatus: string) {
    const task = event.item.data;
    if (task && task.status !== targetStatus) {
      this.taskService.updateTaskStatus(task.id, targetStatus);
    }
  }

  ngAfterViewInit() {
    this.updateConnectedLists();
    this.dropLists.changes.subscribe(() => this.updateConnectedLists());
  }

  private updateConnectedLists() {
    const allLists = this.dropLists.toArray();
    const connected = allLists.map(list =>
      allLists.filter(l => l.data !== list.data)
    );
    this.connectedLists.set(connected);
  }
}
