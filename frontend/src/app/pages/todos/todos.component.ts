import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { TaskItemComponent } from '../../Components/TaskItem/task-item.component';
import { TaskTimer } from '../../models/taskTimer.model';

interface TodoTask extends Task {
  projectId: string;
  projectName: string;
}

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskItemComponent],
  templateUrl: './todos.component.html',
})
export class TodosComponent implements OnInit, OnDestroy {
  projects = signal<Project[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  taskCurrentlyInProgress = signal<string | null>(null);

  todoTasks = computed<TodoTask[]>(() => {
    const tasks: TodoTask[] = [];
    const collectTasks = (project: Project) => {
      for (const task of project.tasks ?? []) {
        if (task.isInTodoList) {
          tasks.push({ ...task, projectId: project.id, projectName: project.name });
        }
      }
      for (const sub of project.subProjects ?? []) {
        collectTasks(sub);
      }
    };
    for (const project of this.projects()) {
      collectTasks(project);
    }
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return 0;
    });
  });

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
    this.getCurrentlyInProgressSession();
  }

  ngOnDestroy(): void {}

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load tasks.');
        this.loading.set(false);
      }
    });
  }

  getCurrentlyInProgressSession(): void {
    this.timeSessionsService.getCurrentActiveSession().subscribe({
      next: (data: any) => this.taskCurrentlyInProgress.set(data?.taskId || null),
      error: () => this.taskCurrentlyInProgress.set(null)
    });
  }

  toggleCompletion(task: TodoTask): void {
    this.projectService.updateTask(task.projectId, task.id, { completed: !task.completed }).subscribe({
      next: () => this.loadProjects(),
      error: () => this.error.set('Failed to update task.')
    });
  }

  toggleTodoList(task: TodoTask): void {
    this.projectService.updateTask(task.projectId, task.id, { isInTodoList: !task.isInTodoList }).subscribe({
      next: () => this.loadProjects(),
      error: () => this.error.set('Failed to update todo list.')
    });
  }

  onEditSaved(updatedTask: Task): void {
    this.loadProjects();
  }

  deleteTask(task: TodoTask, taskId: string): void {
    this.projectService.deleteTask(task.projectId, taskId).subscribe({
      next: () => this.loadProjects(),
      error: () => this.error.set('Failed to delete task.')
    });
  }

  toggleProgress(task: TodoTask): void {
    this.timeSessionsService.startSession(task.id).subscribe({
      next: () => {
        if (this.taskCurrentlyInProgress() && this.taskCurrentlyInProgress() !== task.id) {
          this.pauseTaskTimer();
        }
        this.taskCurrentlyInProgress.set(task.id);
        this.startTaskTimer();
      },
      error: (err) => console.error('Failed to start time session', err)
    });
  }

  pauseProgress(): void {
    this.timeSessionsService.pauseSession().subscribe({
      next: () => {
        this.pauseTaskTimer();
        this.taskCurrentlyInProgress.set(null);
      },
      error: (err) => console.error('Failed to pause time session', err)
    });
  }

  resetTimer(task: TodoTask): void {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    if (taskTimers[task.id]) {
      taskTimers[task.id].elapsedTime = 0;
      taskTimers[task.id].startTime = Date.now();
      localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
    }
  }

  private pauseTaskTimer(): void {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    const currentTaskId = this.taskCurrentlyInProgress();
    if (currentTaskId && taskTimers[currentTaskId]) {
      const timer = taskTimers[currentTaskId];
      if (timer.isRunning && timer.startTime) {
        timer.elapsedTime += Date.now() - timer.startTime;
        timer.startTime = null;
        timer.isRunning = false;
        taskTimers[currentTaskId] = timer;
        localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
      }
    }
  }

  private startTaskTimer(): void {
    const stored = localStorage.getItem('taskTimers');
    const taskTimers: { [taskId: string]: TaskTimer } = stored ? JSON.parse(stored) : {};
    const currentId = this.taskCurrentlyInProgress()!;
    if (!taskTimers[currentId]) {
      taskTimers[currentId] = { taskId: currentId, elapsedTime: 0, isRunning: false, startTime: null };
    }
    taskTimers[currentId].isRunning = true;
    taskTimers[currentId].startTime = Date.now();
    localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
  }
}
