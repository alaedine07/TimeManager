// components/sub-project-list/sub-project-list.component.ts
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { SubProjectFormComponent } from '../SubProjectForm/sub-project-form.component';
import { SubProjectItemComponent } from '../SubProjectItem/sub-project-item.component';

@Component({
  selector: 'app-sub-project-list',
  standalone: true,
  imports: [CommonModule, SubProjectFormComponent, SubProjectItemComponent],
  templateUrl: './sub-project-list.component.html'
})
export class SubProjectListComponent {
  @Input() subProjects: Project[] = [];
  @Input() parentProjectId!: string;
  @Output() subProjectAdded = new EventEmitter<Project>();
  @Output() subProjectUpdated = new EventEmitter<Project>();
  @Output() subProjectDeleted = new EventEmitter<string>();

  showSubProjectForm = signal(false);
  subProjectTotalTimes = signal<{ [subProjectId: string]: string }>({});

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ) {
    this.loadSubProjectTotalTimes();
  }

  toggleSubProjectForm() {
    this.showSubProjectForm.update(val => !val);
  }

  addSubProject(newSubProject: Omit<Project, 'id'>) {
    this.projectService.createSubProject(this.parentProjectId, newSubProject).subscribe({
      next: (created) => {
        this.subProjectAdded.emit(created);
        this.toggleSubProjectForm();
      },
      error: (err) => console.error('Failed to create sub-project', err)
    });
  }

  onUpdated(updatedSubProject: Project) {
    this.subProjectUpdated.emit(updatedSubProject);
  }

  deleteSubProject(subProjectId: string) {
    this.projectService.deleteProject(subProjectId).subscribe({
      next: () => this.subProjectDeleted.emit(subProjectId),
      error: (err) => console.error('Failed to delete sub-project', err)
    });
  }

  private loadSubProjectTotalTimes() {
    this.subProjects.forEach(subProject => {
      this.timeSessionsService.getTotalTimeForProject(subProject.id).subscribe({
        next: (timeSpan) => {
          this.subProjectTotalTimes.update(times => ({
            ...times,
            [subProject.id]: formatTimeSpan(timeSpan)
          }));
        },
        error: (err) => console.error(`Failed to get total time for sub-project ${subProject.id}`, err)
      });
    });
  }
}
