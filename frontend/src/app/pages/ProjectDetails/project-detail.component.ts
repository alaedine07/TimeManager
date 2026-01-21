// components/project-detail/project-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { TaskTimer } from '../../models/taskTimer.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'tasks' | 'subprojects' | null >(null);
  TaskCurrentlyInProgress = signal<string | null>(null);
  taskTotalTimes = signal<{ [taskId: string]: string }>({});
  subProjectTotalTimes = signal<{ [subProjectId: string]: string }>({});
  currentProjectTotalTime = signal<string | null>(null);
  taskBeingDeleted = signal<string | null>(null);
  taskTimers = signal<{ [taskId: string]: number }>({});

  // Task form
  showTaskForm = signal(false);
  editingTaskId = signal<string | null>(null);
  taskForm!: FormGroup;
  editTaskForm!: FormGroup;

  // Sub-project form
  showSubProjectForm = signal(false);
  subProjectForm!: FormGroup;

  private tickInterval: number | null = null;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private timeSessionsService: TimeSessionsService,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProject(String(id));
      }
    });
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

  updateTaskTimers() {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    const timers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    const display: { [taskId: string]: number } = {};
    Object.values(timers).forEach(timer => {
      let elapsed = timer.elapsedTime;
      if (timer.isRunning && timer.startTime) {
        elapsed += Date.now() - timer.startTime;
      }
      display[timer.taskId] = elapsed;
    });
    this.taskTimers.set(display);
  }

  formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return `${h.toString().padStart(2,'0')}:` +
         `${m.toString().padStart(2,'0')}:` +
         `${s.toString().padStart(2,'0')}`;
  }

  initializeForm(): void {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: ['']
    });
    this.editTaskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: [''],
      completed: [false]
    });
  }

  initializeSubProjectForm(): void {
    this.subProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      defaultTabOnOpen: ['tasks']
    });
  }

  loadProject(id: string) {
    this.loading.set(true);
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        console.log('Project loaded successfully:', data);
        this.project.set(data);
        this.loading.set(false);
      // fetch current project total times
      this.timeSessionsService.getTotalTimeForProject(id).subscribe({
        next: (timeSpan) => {
          const formatted = formatTimeSpan(timeSpan);
          this.currentProjectTotalTime.set(formatted);
        },
        error: (err) => console.error('Failed to get total time for project', err)
      });
      // fetch task and sub-project total times
      this.loadTaskTotalTimes(data.tasks ?? []);
      this.loadSubProjectTotalTimes(data.subProjects ?? []);
      this.setActiveTab(data.defaultTabOnOpen || 'tasks');
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Failed to load project');
        this.loading.set(false);
      }
    });
  }

  loadTaskTotalTimes(tasks: Task[]) {
    tasks.forEach(task => {
      this.timeSessionsService.getTotalTimeForTask(task.id).subscribe({
        next: (timeSpan) => {
          const formatted = formatTimeSpan(timeSpan);
          this.taskTotalTimes.update(times => ({
            ...times,
            [task.id]: formatted
          }));
        },
        error: (err) => {
          console.error(`Failed to get total time for task ${task.id}`, err);
        }
      });
    });
  }

  loadSubProjectTotalTimes(subProjects: Project[]) {
    subProjects.forEach(subProject => {
      this.timeSessionsService.getTotalTimeForProject(subProject.id).subscribe({
        next: (timeSpan) => {
          const formatted = formatTimeSpan(timeSpan);
          this.subProjectTotalTimes.update(times => ({
            ...times,
            [subProject.id]: formatted
          }));
        },
        error: (err) => {
          console.error(`Failed to get total time for sub-project ${subProject.id}`, err);
        }
      });
    });
  }

  startEditTask(task: Task) {
    this.editingTaskId.set(task.id);
    this.editTaskForm.patchValue({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? this.formatDateForInput(task.dueDate) : '',
      completed: task.completed
    });
  }

  saveEditTask() {
    if (!this.editTaskForm.valid || !this.project()) return;

    const taskId = this.editingTaskId();
    if (!taskId) return;

    const updates = {
      name: this.editTaskForm.value.name,
      description: this.editTaskForm.value.description || undefined,
      priority: this.editTaskForm.value.priority,
      dueDate: this.editTaskForm.value.dueDate
        ? new Date(this.editTaskForm.value.dueDate)
        : undefined,
      completed: this.editTaskForm.value.completed
    };

  this.projectService.updateTask(this.project()!.id, taskId, updates).subscribe({
    next: (updatedTask) => {
      const proj = this.project();
      if (proj && proj.tasks) {
        const index = proj.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          proj.tasks[index] = updatedTask;
          this.project.set({ ...proj });
        }
      }
      this.cancelEditTask();
    },
    error: (err) => {
        console.error('Failed to update task', err);
        this.error.set('Failed to update task');
      }
    });
  }

  cancelEditTask() {
    this.editingTaskId.set(null);
    this.editTaskForm.reset();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  startDelete(taskId: string) {
    this.taskBeingDeleted.set(taskId);
  }

  confirmDelete(taskId: string) {
    this.deleteTask(taskId);
    this.taskBeingDeleted.set(null);
  }

  cancelDelete() {
    this.taskBeingDeleted.set(null);
  }

  toggleTaskCompletion(task: Task) {
    if (!this.project()) return;
    this.projectService.updateTask(this.project()!.id, task.id, {
      completed: !task.completed
    }).subscribe({
      next: (updatedTask) => {
        const proj = this.project();
        if (proj && proj.tasks) {
          const index = proj.tasks.findIndex(t => t.id === task.id);
          if (index !== -1) {
            proj.tasks[index] = updatedTask;
            this.project.set({ ...proj });
          }
        }
      },
      error: (err) => console.error('Failed to update task', err)
    });
  }

  getCurrentlyInProgressSession() {
    this.timeSessionsService.getCurrentActiveSession().subscribe({
      next: (data: any) => {
        if (data && data.taskId) {
          this.TaskCurrentlyInProgress.set(data.taskId);
        } else {
          this.TaskCurrentlyInProgress.set(null);
        }
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
        // pause the previous task if any
        if (this.TaskCurrentlyInProgress() && this.TaskCurrentlyInProgress() !== task.id) {
          this.pauseTaskTimer();
        }
        this.TaskCurrentlyInProgress.set(task.id);
        this.startTaskTimer();
      },
      error: (err) => {
        console.error('Failed to start time session for task', task.id, err);
      }
    });
  }

  pauseTaskProgress() {
    this.timeSessionsService.pauseSession().subscribe({
      next: () => {
        this.pauseTaskTimer();
        this.TaskCurrentlyInProgress.set(null);
      },
      error: (err) => {
        console.error('Failed to pause time session', err);
      }
    });
  }

  pauseTaskTimer() {
    // Retrieve existing timers from localStorage
    const storedTimers = localStorage.getItem('taskTimers');
    if (!storedTimers) return;
    let taskTimers: { [taskId: string]: TaskTimer } = storedTimers ? JSON.parse(storedTimers) : {};
    const currentTaskId = this.TaskCurrentlyInProgress();
    if (currentTaskId && taskTimers[currentTaskId]) {
      const taskTimer = taskTimers[currentTaskId];
      if (taskTimer.isRunning && taskTimer.startTime) {
        taskTimer.elapsedTime += Date.now() - taskTimer.startTime!;
        taskTimer.startTime = null;
        taskTimer.isRunning = false;
        // Update the timer in localStorage
        taskTimers[currentTaskId] = taskTimer;
        localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
      }
    }
  }

  startTaskTimer() {
    const stored = localStorage.getItem('taskTimers');
    let taskTimers: { [taskId: string]: TaskTimer } = stored ? JSON.parse(stored) : {};
    // if timer doesn't exist for this task, create it
    if (!taskTimers[this.TaskCurrentlyInProgress()!]) {
      let taskTime = {
        taskId: this.TaskCurrentlyInProgress()!,
        elapsedTime: 0,
        isRunning: false,
        startTime: null
      }
      taskTimers[taskTime.taskId] = taskTime;
    }
    taskTimers[this.TaskCurrentlyInProgress()!].isRunning = true;
    taskTimers[this.TaskCurrentlyInProgress()!].startTime = Date.now();
    localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
  }

  resetTaskTimer(task: Task) {
    const stored = localStorage.getItem('taskTimers');
    if (!stored) return;
    let taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
    if (taskTimers[task.id]) {
      const taskTimer = taskTimers[task.id];
      taskTimer.elapsedTime = 0;
      taskTimer.startTime = Date.now();
      taskTimers[task.id] = taskTimer;
      localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
      this.updateTaskTimers();
    }
  }

  deleteTask(taskId: string) {
    if (!this.project()) return;
    this.projectService.deleteTask(this.project()!.id, taskId).subscribe({
      next: () => {
        const proj = this.project();
        if (proj && proj.tasks) {
          proj.tasks = proj.tasks.filter(t => t.id !== taskId);
          this.project.set({ ...proj });
        }
        const stored = localStorage.getItem('taskTimers');
        if (stored) {
          let taskTimers: { [taskId: string]: TaskTimer } = JSON.parse(stored);
          if (taskTimers[taskId]) {
            delete taskTimers[taskId];
            localStorage.setItem('taskTimers', JSON.stringify(taskTimers));
            this.updateTaskTimers();
          }
        }
      },
      error: (err) => console.error('Failed to delete task', err)
    });
  }

  toggleTaskForm(): void {
    this.showTaskForm.update(val => !val);
    if (this.showTaskForm()) {
      this.initializeForm();
    }
  }

  toggleSubProjectForm(): void {
    this.showSubProjectForm.update(val => !val);
    if (this.showSubProjectForm()) {
      this.initializeSubProjectForm();
    }
  }

  addsubProject(): void {
    if (this.subProjectForm.valid && this.project()) {

      const newSubProject: Omit<Project, 'id'> = {
        name: this.subProjectForm.value.name,
        description: this.subProjectForm.value.description || '',
        parentProjectId: this.project()!.id,
        completed: false,
        defaultTabOnOpen: this.subProjectForm.value.defaultTabOnOpen || 'tasks',
        tasks: [],
        subProjects: []
      };

      // Add sub-project via service
      this.projectService.createSubProject(this.project()!.id, newSubProject).subscribe({
        next: (createdSubProject) => {
          const proj = this.project();
          if (proj && proj.subProjects) {
            proj.subProjects.push(createdSubProject);
            this.project.set({ ...proj });
          }
          this.toggleSubProjectForm();
          this.initializeForm();
        },
        error: (err) => {
          console.error('Failed to create sub-project', err);
          this.error.set('Failed to create sub-project');
        }
      });
    }
  }

  addTask(): void {
    if (this.taskForm.valid && this.project()) {
      const newTask: Omit<Task, 'id'> = {
        name: this.taskForm.value.name,
        description: this.taskForm.value.description || undefined,
        completed: false,
        dueDate: this.taskForm.value.dueDate
          ? new Date(this.taskForm.value.dueDate)
          : undefined,
        priority: this.taskForm.value.priority
      };

      // Add task via service
      this.projectService.addTask(this.project()!.id, newTask).subscribe({
        next: (createdTask) => {
          const proj = this.project();
          if (proj && proj.tasks) {
            proj.tasks.push(createdTask);
            this.project.set({ ...proj });
          }
          this.toggleTaskForm();
          this.initializeForm();
        },
        error: (err) => {
          console.error('Failed to create task', err);
          this.error.set('Failed to create task');
        }
      });
    }
  }

  getProgressPercentage(): number {
    const proj = this.project();
    if (!proj || !proj.tasks || proj.tasks.length === 0) return 0;
    return Math.round((proj.tasks.filter(t => t.completed).length / proj.tasks.length) * 100);
  }

  setActiveTab(tab: 'tasks' | 'subprojects') {
    this.activeTab.set(tab);
  }

  getSubProjectCount(): number {
    return this.project()?.subProjects?.length || 0;
  }

  goBack(): void {
    this.location.back();
  }
}
