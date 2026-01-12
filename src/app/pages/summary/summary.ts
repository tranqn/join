import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import { Taskservice } from '../../services/taskservice';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-summary',
  imports: [Icon, RouterLink],
  templateUrl: './summary.html',
  styleUrl: './summary.scss',
})
export class Summary {
  taskService = inject(Taskservice);
  authService = inject(AuthService);
  router = inject(Router);

  userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'Guest';
    return user.isAnonymous ? 'Guest' : (user.displayName || 'User');
  });

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  });

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

  nextUrgentTask = computed(() => {
    const urgent = this.urgentTasks().filter(t => t.dueDate);
    if (urgent.length === 0) return null;
    
    return urgent.reduce((prev, curr) => {
      const prevDate = new Date(prev.dueDate).getTime();
      const currDate = new Date(curr.dueDate).getTime();
      return prevDate < currDate ? prev : curr;
    });
  });

  upcomingDeadline = computed(() => {
    const task = this.nextUrgentTask();
    if (!task) return 'No upcoming deadline';
    
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });
  /**
   * Navigates to the board page with the next urgent task selected.
   */  navigateToTask() {
    const task = this.nextUrgentTask();
    if (task) {
      this.router.navigate(['/board'], { queryParams: { taskId: task.id } });
    }
  }
}
