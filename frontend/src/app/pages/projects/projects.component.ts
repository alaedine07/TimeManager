// frontend/src/app/pages/projects/projects.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeProjectMenu = signal<number | null>(null);
  projectTotalTimes = signal<{ [projectId: number]: string }>({});

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ){}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);

        // Fetch total time for each project
        data.forEach(project => {
          this.timeSessionsService.getTotalTimeForProject(project.id).subscribe({
            next: (timeSpan) => {
              const formatted = formatTimeSpan(timeSpan);
              this.projectTotalTimes.update(times => ({ ...times, [project.id]: formatted }));
            },
            error: (err) => console.error('Failed to get total time for project', err)
          });
        });
      },
      error: (err) => {
        this.error.set('Failed to load projects :(');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  showCreateForm() {
    alert('Create form coming next!');
  }

  getProgressPercentage(project: Project): number {
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round(((project.completedTasks ?? 0) / project.totalTasks) * 100);
  }

  getPendingTasks(project: Project): number {
    if (!project.totalTasks) return 0;
    return project.totalTasks - (project.completedTasks || 0);
  }

  closeProjectMenu() {
    this.activeProjectMenu.set(null);
  }

  openProjectMenu(event: Event, project: Project) {
    event.stopPropagation();
    this.activeProjectMenu.set(project.id);
  }

  toggleProjectMenu(event: Event, project: Project) {
    event.stopPropagation();
    const current = this.activeProjectMenu();
    this.activeProjectMenu.set(current === project.id ? null : project.id);
  }

  editProject(event: Event, project: Project) {
    console.log('Edit project:', project);
    alert('Edit form coming soon!');
    this.closeProjectMenu();
  }

  toggleProjectComplete(event: Event, project: Project) {
    const completed = !project.completed;
    this.projectService.updateProject(project.id, { completed }).subscribe({
      next: (updated) => {
        const projects = this.projects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          projects[index] = updated;
          this.projects.set([...projects]);
        }
        this.closeProjectMenu();
      },
      error: (err) => console.error('Failed to update project', err)
    });
  }

  archiveProject(event: Event, project: Project) {
    if (confirm(`Archive "${project.name}"?`)) {
      console.log('Archive project:', project);
      alert('Archive functionality coming soon!');
      this.closeProjectMenu();
    }
  }

  deleteProject(event: Event, project: Project) {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      this.projectService.deleteProject(project.id).subscribe({
        next: () => {
          this.projects.set(this.projects().filter(p => p.id !== project.id));
          this.closeProjectMenu();
        },
        error: (err) => console.error('Failed to delete project', err)
      });
    }
  }
}
