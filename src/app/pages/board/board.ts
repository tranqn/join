import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskOverview } from "./task-overview/task-overview";
import { AddTask } from '../add-task/add-task';

@Component({
  selector: 'app-board',
  imports: [FormsModule, TaskOverview, AddTask],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  search = signal('');
  isAddTaskModalOpen = signal(false);

  openAddTaskModal() {
    this.isAddTaskModalOpen.set(true);
  }

  closeAddTaskModal() {
    this.isAddTaskModalOpen.set(false);
  }
}
