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
  activeTab = signal<'tasks' | 'subprojects'>('tasks');
  TaskCurrentlyInProgress = signal<number | null>(null);

  // Task form
  showTaskForm = signal(false);
  taskForm!: FormGroup;

  // Sub-project form
  showSubProjectForm = signal(false);
  subProjectForm!: FormGroup;

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private timeSessionsService: TimeSessionsService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProject(Number(id));
      }
    });
    this.getCurrentlyInProgressSession();
  }

  initializeForm(): void {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: ['']
    });
  }

  initializeSubProjectForm(): void {
    this.subProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
  }

  loadProject(id: number) {
    this.loading.set(true);
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        console.log('Project loaded successfully:', data);
        this.project.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.error.set('Failed to load project');
        this.loading.set(false);
      }
    });
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
    console.log('Fetching current active time session...');
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
    console.log('Toggling task progress for task', task.id);
    this.timeSessionsService.startSession(task.id).subscribe({
      next: (response) => {
        console.log('Time session started for task', task.id, response);
        this.TaskCurrentlyInProgress.set(task.id);
      },
      error: (err) => {
        console.error('Failed to start time session for task', task.id, err);
      }
    });
  }

  pauseTaskProgress() {
    this.timeSessionsService.pauseSession().subscribe({
      next: (response) => {
        console.log('Time session paused', response);
        this.TaskCurrentlyInProgress.set(null);
      },
      error: (err) => {
        console.error('Failed to pause time session', err);
      }
    });
  }

  deleteTask(taskId: number) {
    if (!this.project()) return;
    this.projectService.deleteTask(this.project()!.id, taskId).subscribe({
      next: () => {
        const proj = this.project();
        if (proj && proj.tasks) {
          proj.tasks = proj.tasks.filter(t => t.id !== taskId);
          this.project.set({ ...proj });
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
      const newSubProject: Project = {
        id: Date.now(),
        name: this.subProjectForm.value.name,
        description: this.subProjectForm.value.description || '',
        parentProjectId: this.project()!.id,
        completed: false,
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
      const newTask: Task = {
        id: Date.now(),
        name: this.taskForm.value.name,
        description: this.taskForm.value.description || undefined,
        completed: false,
        dueDate: this.taskForm.value.dueDate ? new Date(this.taskForm.value.dueDate) : undefined,
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
