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
  moveItemInArray,
  transferArrayItem
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
  connectedLists = signal<string[]>([]);

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
  }

  ngAfterViewInit() {
    this.updateConnectedLists();
    this.dropLists.changes.subscribe(() => this.updateConnectedLists());
  }

  private updateConnectedLists() {
    const ids = this.columns.map(col => col.id);
    this.connectedLists.set(ids);
  }
}
