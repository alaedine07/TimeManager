import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { TaskFormComponent } from '../TaskForm/task-form.component';
import { TaskItemComponent } from '../TaskItem/task-item.component';
import { formatTimeSpan } from '../../utils/time-format.util';
import { TaskTimer } from '../../models/taskTimer.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskItemComponent],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  @Input() tasks: Task[] = [];
  @Input() projectId!: string;
  @Output() taskAdded = new EventEmitter<Task>();
  @Output() taskUpdated = new EventEmitter<Task>();
  @Output() taskDeleted = new EventEmitter<string>();

  showTaskForm = signal(false);
  TaskCurrentlyInProgress = signal<string | null>(null);
  taskTotalTimes = signal<{ [taskId: string]: string }>({});
  taskTimers = signal<{ [taskId: string]: number }>({});

  private tickInterval: number | null = null;

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ) {}

  ngOnInit() {
    this.loadTaskTotalTimes();
    this.getCurrentlyInProgressSession();
    this.tickInterval = window.setInterval(() => {
      this.updateTaskTimers();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
    }
  }

  toggleTaskForm() {
    this.showTaskForm.update(val => !val);
  }

  addTask(newTask: Omit<Task, 'id'>) {
    this.projectService.addTask(this.projectId, newTask).subscribe({
      next: (createdTask: Task) => {
        createdTask.checkpoints = [];
        this.taskAdded.emit(createdTask);
        this.toggleTaskForm();
      },
      error: (err) => console.error('Failed to create task', err)
    });
  }

  onEditSaved(updatedTask: Task) {
    this.taskUpdated.emit(updatedTask);
  }

  deleteTask(taskId: string) {
    this.projectService.deleteTask(this.projectId, taskId).subscribe({
      next: () => {
        this.taskDeleted.emit(taskId);
        // Clean timer
        const stored = localStorage.getItem('taskTimers');
        if (stored) {
          let taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
          delete taskTimers[taskId];
          localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
          this.updateTaskTimers();
        }
      },
      error: (err) => console.error('Failed to delete task', err)
    });
  }

  toggleTaskCompletion(task: Task) {
    this.projectService.updateTask(this.projectId, task.id, { completed: !task.completed }).subscribe({
      next: (updatedTask) => this.taskUpdated.emit(updatedTask),
      error: (err) => console.error('Failed to update task', err)
    });
  }

  toggleTodoList(task: Task) {
    this.projectService.updateTask(this.projectId, task.id, { isInTodoList: !task.isInTodoList }).subscribe({
      next: (updatedTask) => this.taskUpdated.emit(updatedTask),
      error: (err) => console.error('Failed to toggle todo list', err)
    });
  }

  getCurrentlyInProgressSession() {
    this.timeSessionsService.getCurrentActiveSession().subscribe({
      next: (data: any) => {
        this.TaskCurrentlyInProgress.set(data?.taskId || null);
      },
      error: (err) => {
        console.error('Failed to get current active session', err);
        this.TaskCurrentlyInProgress.set(null);
      }
    });
  }

  toggleTaskProgress(task: Task) {
    this.timeSessionsService.startSession(task.id).subscribe({
      next: () => {
        if (this.TaskCurrentlyInProgress() && this.TaskCurrentlyInProgress() !== task.id) {
          this.pauseTaskTimer();
        }
        this.TaskCurrentlyInProgress.set(task.id);
        this.startTaskTimer();
      },
      error: (err) => console.error('Failed to start time session for task', task.id, err)
    });
  }

  pauseTaskProgress() {
    this.timeSessionsService.pauseSession().subscribe({
      next: () => {
        this.pauseTaskTimer();
        this.TaskCurrentlyInProgress.set(null);
      },
      error: (err) => console.error('Failed to pause time session', err)
    });
  }

  private pauseTaskTimer() {
    const storedTimers = localStorage.getItem('taskTimers');
    if (!storedTimers) return;
    let taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(storedTimers);
    const currentTaskId = this.TaskCurrentlyInProgress();
    if (currentTaskId && taskTimers[currentTaskId]) {
      const taskTimer = taskTimers[currentTaskId];
      if (taskTimer.isRunning && taskTimer.startTime) {
        taskTimer.elapsedTime += Date.now() - taskTimer.startTime;
        taskTimer.startTime = null;
        taskTimer.isRunning = false;
        taskTimers[currentTaskId] = taskTimer;
        localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
      }
    }
  }

  private startTaskTimer() {
    const stored = localStorage.getItem('taskTimers');
    let taskTimers: { [taskId: string]: TaskTimer } = stored ? JSON.parse(stored) : {};
    const currentId = this.TaskCurrentlyInProgress()!;
    if (!taskTimers[currentId]) {
      taskTimers[currentId] = {
        taskId: currentId,
        elapsedTime: 0,
        isRunning: false,
        startTime: null
      };
    }
    taskTimers[currentId].isRunning = true;
    taskTimers[currentId].startTime = Date.now();
    localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
  }

  resetTaskTimer(task: Task) {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    let taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    if (taskTimers[task.id]) {
      taskTimers[task.id].elapsedTime = 0;
      taskTimers[task.id].startTime = Date.now();
      localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
      this.updateTaskTimers();
    }
  }

  private updateTaskTimers() {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const timers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    const display: { [taskId: string]: number } = {};
    Object.entries(timers).forEach(([taskId, timer]) => {
      let elapsed = timer.elapsedTime;
      if (timer.isRunning && timer.startTime) {
        elapsed += Date.now() - timer.startTime;
      }
      display[taskId] = elapsed;
    });
    this.taskTimers.set(display);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private loadTaskTotalTimes() {
    this.tasks.forEach(task => {
      this.timeSessionsService.getTotalTimeForTask(task.id).subscribe({
        next: (timeSpan) => {
          this.taskTotalTimes.update(times => ({
            ...times,
            [task.id]: formatTimeSpan(timeSpan)
          }));
        },
        error: (err) => console.error(`Failed to get total time for task ${task.id}`, err)
      });
    });
  }

  getTasksSortedByCompletion(): Task[] {
    return [...this.tasks].sort((a, b) => (a.completed === b.completed) ? 0 : (a.completed ? 1 : -1));
  }
}
