// components/project-detail/project-detail.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss'
})
export class ProjectDetailComponent implements OnInit {
  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'tasks' | 'subprojects'>('tasks');

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      console.log('Project ID from route:', id, typeof id);
      if (id) {
        this.loadProject(Number(id));
      }
    });
  }

  loadProject(id: number) {
    console.log('Loading project with ID:', id);
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
