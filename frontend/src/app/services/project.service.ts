// frontend/src/app/services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';
import { Task  } from '../models/task.model';
import { environment } from '../../environments/environment';

export type DataSource = 'mock' | 'api';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  private apiUrl = environment.apiUrl + '/Projects';
  private dataSource: DataSource = 'api'; // Set to 'api' to use real API

  constructor(private http: HttpClient) {}

  /**
   * Switch between mock data and API
   * @param source 'mock' for local mock data, 'api' for HTTP API
   */
  setDataSource(source: DataSource): void {
    this.dataSource = source;
    console.log(`Data source changed to: ${source}`);
  }

  /**
   * Get current data source
   */
  getDataSource(): DataSource {
    return this.dataSource;
  }

  /**
   * Get all root projects (no parent)
   */
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  /**
   * Get a specific project with all its tasks and sub-projects
   */
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new project or sub-project
   */
  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}`, project);
  }

  /**
   * Update a project
   */
  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  /**
   * Delete a project
   */
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add a task to a project
   */
  addTask(projectId: string, task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, task);
  }

  /**
   * Update a task
   */
  updateTask(projectId: string, taskId: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, task);
  }

  /**
   * Delete a task
   */
  deleteTask(projectId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/tasks/${taskId}`);
  }

  /**
   * Get all tasks for a project (including sub-projects recursively)
   */
  getProjectTasks(projectId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/${projectId}/tasks`);
  }

  /**
   * Create a sub-project
   */
  createSubProject(parentProjectId: string, subProject: Omit<Project, 'id' | 'parentProjectId'>): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/${parentProjectId}/subprojects`, subProject);
  }

  /**
   * Get all sub-projects
   */
  getSubProjects(parentProjectId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/${parentProjectId}/subprojects`);
  }

  /**
   * Calculate recursive stats (useful for display)
   */
  calculateRecursiveStats(project: Project): { total: number; completed: number } {
    let total = project.tasks?.length || 0;
    let completed = project.tasks?.filter(t => t.completed).length || 0;

    if (project.subProjects && project.subProjects.length > 0) {
      for (const subProject of project.subProjects) {
        const stats = this.calculateRecursiveStats(subProject);
        total += stats.total;
        completed += stats.completed;
      }
    }

    return { total, completed };
  }
}
