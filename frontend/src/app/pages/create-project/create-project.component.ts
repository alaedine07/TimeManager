// components/create-project/create-project.component.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss'
})
export class CreateProjectComponent {
  projectName = signal('');
  projectDescription = signal('');
  projectCategory = signal('General');
  defaultTabOnOpen = signal<'tasks' | 'subprojects'>('tasks');
  loading = signal(false);
  error = signal<string | null>(null);
  categories = ['General', 'Design', 'Development', 'Marketing', 'Research', 'Other'];

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private location: Location
  ) {}

  createProject() {
    if (!this.projectName().trim()) {
      this.error.set('Project name is required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const newProject: Omit<Project, 'id'> = {
      name: this.projectName().trim(),
      description: this.projectDescription().trim(),
      category: this.projectCategory(),
      defaultTabOnOpen: this.defaultTabOnOpen(),
      tasks: [],
      subProjects: [],
      totalTasks: 0,
      completedTasks: 0
    };

    this.projectService.createProject(newProject).subscribe({
      next: (project) => {
        this.loading.set(false);
        this.router.navigate(['']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to create project');
        console.error(err);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
