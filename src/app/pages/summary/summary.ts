import { Component, inject, computed } from '@angular/core';
import { Icon } from '../../shared/icon/icon';
import { Taskservice } from '../../services/taskservice';

@Component({
  selector: 'app-summary',
  imports: [Icon],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  taskService = inject(Taskservice);

  todoCount = computed(() => this.taskService.tasksTodo().length);
  doneCount = computed(() => this.taskService.tasksDone().length);
  progressCount = computed(() => this.taskService.tasksProgress().length);
  feedbackCount = computed(() => this.taskService.tasksFeedback().length);
  totalCount = computed(() => 
    this.todoCount() + this.doneCount() + this.progressCount() + this.feedbackCount()
  );

  urgentTasks = computed(() => {
    const all = [
      ...this.taskService.tasksTodo(),
      ...this.taskService.tasksProgress(),
      ...this.taskService.tasksFeedback()
    ];
    return all.filter(t => t.priority === 'urgent');
  });

  urgentCount = computed(() => this.urgentTasks().length);

  upcomingDeadline = computed(() => {
    const urgent = this.urgentTasks().filter(t => t.dueDate);
    if (urgent.length === 0) return 'No upcoming deadline';
    
    const dates = urgent.map(t => new Date(t.dueDate).getTime());
    const minDate = new Date(Math.min(...dates));
    
    return minDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
}
