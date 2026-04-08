import { Component, EventEmitter, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task } from '../../models/task.model';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { TaskFormComponent } from '../TaskForm/task-form.component';
import { CheckpointsComponent } from '../Checkpoints/checkpoints.component';
import { Output } from '@angular/core';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, RouterModule, TaskFormComponent, CheckpointsComponent],
  templateUrl: './task-item.component.html'
})
export class TaskItemComponent implements OnInit, OnDestroy, OnChanges {
  @Input() task!: Task;
  @Input() projectId!: string;
  @Input() projectName?: string;
  @Input() isInProgress = false;
  @Output() completionToggled = new EventEmitter<Task>();
  @Output() progressToggled = new EventEmitter<Task>();
  @Output() progressPaused = new EventEmitter<void>();
  @Output() timerReset = new EventEmitter<Task>();
  @Output() editSaved = new EventEmitter<Task>();
  @Output() deleted = new EventEmitter<string>();
  @Output() todoToggled = new EventEmitter<Task>();

  editing = signal(false);
  taskBeingDeleted = signal(false);
  taskTotalTime = signal<string | null>(null);
  taskTimer = signal<number | null>(null);

  private timerInterval: any;

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ) {}

  ngOnInit() {
    this.loadTotalTime();
    this.loadTimerFromStorage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isInProgress'] && !changes['isInProgress'].firstChange) {
      if (this.isInProgress) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private loadTotalTime() {
    this.timeSessionsService.getTotalTimeForTask(this.task.id).subscribe({
      next: (timeSpan) => this.taskTotalTime.set(formatTimeSpan(timeSpan)),
      error: (err) => console.error(`Failed to get total time for task ${this.task.id}`, err)
    });
  }

  private startTimer() {
    if (this.timerInterval) {
      return; // Timer already running
    }
    this.timerInterval = setInterval(() => {
      this.taskTimer.update(current => {
        const newValue = (current || 0) + 1000;
        this.saveTimerToStorage(newValue);
        return newValue;
      });
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private getTimerStorageKey(): string {
    return `timer_task_${this.task.id}`;
  }

  private loadTimerFromStorage() {
    const stored = localStorage.getItem(this.getTimerStorageKey());
    if (stored) {
      try {
        const value = parseInt(stored, 10);
        this.taskTimer.set(value);
      } catch (e) {
        console.error('Failed to parse timer from storage', e);
      }
    }
  }

  private saveTimerToStorage(value: number) {
    localStorage.setItem(this.getTimerStorageKey(), value.toString());
  }

  startEdit() {
    this.editing.set(true);
  }

  saveEditTask(updates: Omit<Task, 'id'>) {
    this.projectService.updateTask(this.projectId, this.task.id, updates).subscribe({
      next: (updatedTask) => {
        this.editSaved.emit(updatedTask);
        this.editing.set(false);
      },
      error: (err) => console.error('Failed to update task', err)
    });
  }

  cancelEdit() {
    this.editing.set(false);
  }

  startDelete() {
    this.taskBeingDeleted.set(true);
  }

  confirmDelete() {
    this.deleted.emit(this.task.id);
    this.taskBeingDeleted.set(false);
  }

  cancelDelete() {
    this.taskBeingDeleted.set(false);
  }

  resetTimer() {
    this.taskTimer.set(null);
    localStorage.removeItem(this.getTimerStorageKey());
    this.timerReset.emit(this.task);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
