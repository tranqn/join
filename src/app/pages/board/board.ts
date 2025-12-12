import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskOverview } from "./task-overview/task-overview";

@Component({
  selector: 'app-board',
  imports: [FormsModule, TaskOverview],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  search = signal('');
}
