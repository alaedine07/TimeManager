import { Component, EventEmitter, Input, Output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { SubProjectFormComponent } from '../SubProjectForm/sub-project-form.component';

@Component({
  selector: 'app-sub-project-item',
  standalone: true,
  imports: [CommonModule, RouterLink, SubProjectFormComponent],
  templateUrl: './sub-project-item.component.html'
})
export class SubProjectItemComponent implements OnInit {
  @Input() subProject!: Project;
  @Output() updated = new EventEmitter<Project>();
  @Output() deleted = new EventEmitter<string>();

  editing = signal(false);
  beingDeleted = signal(false);
  totalTime = signal<string | null>(null);

  constructor(
    private projectService: ProjectService,
    private timeSessionsService: TimeSessionsService
  ) {}

  ngOnInit() {
    this.loadTotalTime();
  }

  private loadTotalTime() {
    this.timeSessionsService.getTotalTimeForProject(this.subProject.id).subscribe({
      next: (timeSpan) => this.totalTime.set(formatTimeSpan(timeSpan)),
      error: (err) => console.error(`Failed to get total time for sub-project ${this.subProject.id}`, err)
    });
  }

  toggleComplete() {
    this.update({ completed: !this.subProject.completed });
  }

  toggleArchive() {
    this.update({ archived: !this.subProject.archived });
  }

  startEdit() {
    this.editing.set(true);
  }

  saveEditSubProject(updates: Omit<Project, 'id'>) {
    this.projectService.updateProject(this.subProject.id, updates).subscribe({
      next: (updated) => {
        this.updated.emit(updated);
        this.editing.set(false);
      },
      error: (err) => console.error('Failed to update sub-project', err)
    });
  }

  cancelEdit() {
    this.editing.set(false);
  }

  startDelete() {
    this.beingDeleted.set(true);
  }

  confirmDelete() {
    this.deleted.emit(this.subProject.id);
    this.beingDeleted.set(false);
  }

  cancelDelete() {
    this.beingDeleted.set(false);
  }

  private update(updates: Partial<Project>) {
    this.projectService.updateProject(this.subProject.id, updates).subscribe({
      next: (updated) => {
        this.updated.emit(updated);
      },
      error: (err) => console.error('Failed to update sub-project', err)
    });
  }
}
