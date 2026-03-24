import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeProjectMenu = signal<string | null>(null);
  projectTotalTimes = signal<{ [projectId: string]: string }>({});
  deleteConfirmingProjectId = signal<string | null>(null);
  deleteInProgress = signal(false);

  // Edit mode signals
  editingProjectId = signal<string | null>(null);
  editFormData = signal<Partial<Project>>({});
  editFormLoading = signal(false);
  editFormError = signal<string | null>(null);

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
        this.error.set('Failed to load projects 😔');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  showCreateForm() {
    alert('Create form coming next!');
  }

  shouldShowSubProjectStats(project: Project): boolean {
    return project.defaultTabOnOpen === 'subprojects';
  }

  getProgressPercentage(project: Project): number {
    if (this.shouldShowSubProjectStats(project)) {
      return this.getSubProjectProgressPercentage(project);
    }
    if (!project.totalTasks || project.totalTasks === 0) return 0;
    return Math.round(((project.completedTasks ?? 0) / project.totalTasks) * 100);
  }

  getPendingTasks(project: Project): number {
    if (!project.totalTasks) return 0;
    return project.totalTasks - (project.completedTasks || 0);
  }

  getSubProjectCount(project: Project): number {
    return project.subProjects?.length || 0;
  }

  getCompletedSubProjects(project: Project): number {
    return (project.subProjects?.filter(sp => sp.completed)?.length || 0);
  }

  getPendingSubProjects(project: Project): number {
    const total = this.getSubProjectCount(project);
    const completed = this.getCompletedSubProjects(project);
    return total - completed;
  }

  getSubProjectProgressPercentage(project: Project): number {
    const total = this.getSubProjectCount(project);
    if (!total || total === 0) return 0;
    const completed = this.getCompletedSubProjects(project);
    return Math.round((completed / total) * 100);
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

  // Edit Mode Methods
  startEditProject(event: Event, project: Project) {
    event.stopPropagation();
    this.editingProjectId.set(project.id);
    this.editFormData.set({
      name: project.name,
      description: project.description,
      category: project.category,
      defaultTabOnOpen: project.defaultTabOnOpen || 'tasks'
    });
    this.editFormError.set(null);
    this.closeProjectMenu();
  }

  cancelEditProject(event: Event) {
    event.stopPropagation();
    this.editingProjectId.set(null);
    this.editFormData.set({});
    this.editFormError.set(null);
  }

  saveEditProject(event: Event, project: Project) {
    event.stopPropagation();

    const formData = this.editFormData();

    // Validation
    if (!formData.name || !formData.name.trim()) {
      this.editFormError.set('Project name is required');
      return;
    }

    this.editFormLoading.set(true);
    this.editFormError.set(null);

    this.projectService.updateProject(project.id, {
      name: formData.name?.trim(),
      description: formData.description?.trim() || '',
      category: formData.category?.trim() || 'General',
      defaultTabOnOpen: formData.defaultTabOnOpen || 'tasks'
    }).subscribe({
      next: (updated) => {
        const projects = this.projects();
        const index = projects.findIndex(p => p.id === project.id);
        if (index !== -1) {
          projects[index] = updated;
          this.projects.set([...projects]);
        }
        this.editingProjectId.set(null);
        this.editFormData.set({});
        this.editFormLoading.set(false);
      },
      error: (err) => {
        this.editFormError.set('Failed to update project. Please try again.');
        this.editFormLoading.set(false);
        console.error('Failed to update project', err);
      }
    });
  }

  toggleProjectComplete(project: Project) {
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

  archiveProject(project: Project) {
    if (confirm(`Archive "${project.name}"?`)) {
      console.log('Archive project:', project);
      alert('Archive functionality coming soon!');
      this.closeProjectMenu();
    }
  }

  initiateDeleteProject(event: Event, project: Project) {
    event.stopPropagation();
    this.deleteConfirmingProjectId.set(project.id);
  }

  cancelDeleteProject(event: Event) {
    event.stopPropagation();
    this.deleteConfirmingProjectId.set(null);
  }

  confirmDeleteProject(event: Event, project: Project) {
    event.stopPropagation();
    this.deleteInProgress.set(true);

    this.projectService.deleteProject(project.id).subscribe({
      next: () => {
        this.projects.set(this.projects().filter(p => p.id !== project.id));
        this.deleteConfirmingProjectId.set(null);
        this.deleteInProgress.set(false);
        this.closeProjectMenu();
      },
      error: (err) => {
        console.error('Failed to delete project', err);
        this.deleteInProgress.set(false);
        this.deleteConfirmingProjectId.set(null);
      }
    });
  }
}
