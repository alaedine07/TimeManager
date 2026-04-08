// components/project-detail/project-detail.component.ts
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { TimeSessionsService } from '../../services/timeSessions.service';
import { formatTimeSpan } from '../../utils/time-format.util';
import { TaskListComponent } from '../../Components/TaskList/task-list.component';
import { SubProjectListComponent } from '../../Components/SubProjectList/sub-project-list.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, TaskListComponent, SubProjectListComponent],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  @ViewChild('taskList', { static: false }) taskListComponent!: TaskListComponent;

  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'tasks' | 'subprojects'>('tasks');
  currentProjectTotalTime = signal<string | null>(null);

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private location: Location,
    private timeSessionsService: TimeSessionsService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProject(String(id));
      }
    });
  }

  loadProject(id: string) {
    this.loading.set(true);
    this.projectService.getProjectById(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
        this.timeSessionsService.getTotalTimeForProject(id).subscribe({
          next: (timeSpan) => {
            this.currentProjectTotalTime.set(formatTimeSpan(timeSpan));
          },
          error: (err) => console.error('Failed to get total time for project', err)
        });
        this.setActiveTab(data.defaultTabOnOpen || 'tasks');
        // Load checkpoints delegated to TaskList/TaskItem
      },
      error: (err) => {
        this.error.set('Failed to load project');
        this.loading.set(false);
      }
    });
  }

  onTaskAdded(newTask: Task) {
    const proj = this.project();
    if (proj) {
      proj.tasks = [...(proj.tasks ?? []), newTask];
      this.project.set({ ...proj });
    }
  }

  onTaskUpdated(updatedTask: Task) {
    const proj = this.project();
    if (proj && proj.tasks) {
      const index = proj.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        proj.tasks[index] = updatedTask;
        this.project.set({ ...proj });
      }
    }
  }

  onTaskDeleted(taskId: string) {
    const proj = this.project();
    if (proj && proj.tasks) {
      proj.tasks = proj.tasks.filter(t => t.id !== taskId);
      this.project.set({ ...proj });
    }
  }

  onSubProjectAdded(newSubProject: Project) {
    const proj = this.project();
    if (proj) {
      proj.subProjects = [...(proj.subProjects ?? []), newSubProject];
      this.project.set({ ...proj });
    }
  }

  onSubProjectUpdated(updatedSubProject: Project) {
    const proj = this.project();
    if (proj && proj.subProjects) {
      const index = proj.subProjects.findIndex(sp => sp.id === updatedSubProject.id);
      if (index !== -1) {
        proj.subProjects[index] = updatedSubProject;
        this.project.set({ ...proj });
      }
    }
  }

  onSubProjectDeleted(subProjectId: string) {
    const proj = this.project();
    if (proj && proj.subProjects) {
      proj.subProjects = proj.subProjects.filter(sp => sp.id !== subProjectId);
      this.project.set({ ...proj });
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

  scrollToTaskForm(): void {
    if (this.taskListComponent) {
      this.taskListComponent.toggleTaskForm();
      // Scroll to the task form
      setTimeout(() => {
        const taskForm = document.querySelector('app-task-list app-task-form');
        if (taskForm) {
          taskForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }
}
