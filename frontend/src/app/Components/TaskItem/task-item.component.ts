import { Component, EventEmitter, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, signal, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Task } from '../../models/task.model';
import { TaskTimer } from '../../models/taskTimer.model';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { TaskFormComponent } from '../TaskForm/task-form.component';
import { CheckpointsComponent } from '../Checkpoints/checkpoints.component';
import { Output } from '@angular/core';

export interface TimerStartEvent {
  task: Task;
  duration: number | null;
}

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
  @Output() progressToggled = new EventEmitter<TimerStartEvent>();
  @Output() progressPaused = new EventEmitter<void>();
  @Output() timerReset = new EventEmitter<Task>();
  @Output() editSaved = new EventEmitter<Task>();
  @Output() deleted = new EventEmitter<string>();
  @Output() todoToggled = new EventEmitter<Task>();

  editing = signal(false);
  taskBeingDeleted = signal(false);
  taskTotalTime = signal<string | null>(null);
  taskTimer = signal<number | null>(null);
  showDurationPicker = signal(false);

  readonly durationOptions = [
    { label: '30 min', value: 30 * 60 * 1000 },
    { label: '45 min', value: 45 * 60 * 1000 },
    { label: '1h', value: 60 * 60 * 1000 },
    { label: '1h 30', value: 90 * 60 * 1000 },
    { label: 'Unlimited', value: null as number | null },
  ];

  private timerInterval: any;

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService,
    private elementRef: ElementRef
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
      this.updateTimerDisplay();
    }, 1000);
  }

  private updateTimerDisplay() {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const timers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    const timer = timers[this.task.id];
    if (!timer) return;

    let elapsed = timer.elapsedTime;
    if (timer.isRunning && timer.startTime) {
      elapsed += Date.now() - timer.startTime;
    }

    if (timer.duration) {
      const remaining = Math.max(timer.duration - elapsed, 0);
      this.taskTimer.set(remaining);
    } else {
      this.taskTimer.set(elapsed);
    }
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private loadTimerFromStorage() {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const timers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    const timer = timers[this.task.id];
    if (!timer) return;

    let elapsed = timer.elapsedTime;
    if (timer.isRunning && timer.startTime) {
      elapsed += Date.now() - timer.startTime;
    }

    if (timer.duration) {
      this.taskTimer.set(Math.max(timer.duration - elapsed, 0));
    } else {
      this.taskTimer.set(elapsed);
    }
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
    this.timerReset.emit(this.task);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  onPlayClick() {
    if (this.isInProgress) {
      this.progressPaused.emit();
    } else {
      this.showDurationPicker.set(true);
    }
  }

  selectDuration(duration: number | null) {
    this.showDurationPicker.set(false);
    this.progressToggled.emit({ task: this.task, duration });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showDurationPicker() && !this.elementRef.nativeElement.contains(event.target)) {
      this.showDurationPicker.set(false);
    }
  }
}
