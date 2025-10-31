// services/project.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Project, ProjectWithStats } from '../models/project.model';
import { Task  } from '../models/task.model';
import { MOCK_PROJECTS } from '../mocks/projects.mock';

export type DataSource = 'mock' | 'api';

@Injectable({
  providedIn: 'root'
})

export class ProjectService {
  private apiUrl = '/api/projects';
  private dataSource: DataSource = 'mock'; // Set to 'api' when ready
  private mockData: Project[] = JSON.parse(JSON.stringify(MOCK_PROJECTS)); // Deep copy

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
    if (this.dataSource === 'mock') {
      return this.getMockRootProjects();
    }
    return this.http.get<Project[]>(`${this.apiUrl}`);
  }

  /**
   * Get a specific project with all its tasks and sub-projects
   */
  getProjectById(id: number): Observable<Project> {
    if (this.dataSource === 'mock') {
      return this.getMockProjectById(id);
    }
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new project or sub-project
   */
  createProject(project: Omit<Project, 'id'>): Observable<Project> {
    if (this.dataSource === 'mock') {
      return this.createMockProject(project);
    }
    return this.http.post<Project>(`${this.apiUrl}`, project);
  }

  /**
   * Update a project
   */
  updateProject(id: number, project: Partial<Project>): Observable<Project> {
    if (this.dataSource === 'mock') {
      return this.updateMockProject(id, project);
    }
    return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
  }

  /**
   * Delete a project
   */
  deleteProject(id: number): Observable<void> {
    if (this.dataSource === 'mock') {
      return this.deleteMockProject(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add a task to a project
   */
  addTask(projectId: number, task: Omit<Task, 'id'>): Observable<Task> {
    if (this.dataSource === 'mock') {
      return this.addMockTask(projectId, task);
    }
    return this.http.post<Task>(`${this.apiUrl}/${projectId}/tasks`, task);
  }

  /**
   * Update a task
   */
  updateTask(projectId: number, taskId: number, task: Partial<Task>): Observable<Task> {
    if (this.dataSource === 'mock') {
      return this.updateMockTask(projectId, taskId, task);
    }
    return this.http.put<Task>(`${this.apiUrl}/${projectId}/tasks/${taskId}`, task);
  }

  /**
   * Delete a task
   */
  deleteTask(projectId: number, taskId: number): Observable<void> {
    if (this.dataSource === 'mock') {
      return this.deleteMockTask(projectId, taskId);
    }
    return this.http.delete<void>(`${this.apiUrl}/${projectId}/tasks/${taskId}`);
  }

  /**
   * Get all tasks for a project (including sub-projects recursively)
   */
  getProjectTasks(projectId: number): Observable<Task[]> {
    if (this.dataSource === 'mock') {
      return this.getMockProjectTasks(projectId);
    }
    return this.http.get<Task[]>(`${this.apiUrl}/${projectId}/tasks`);
  }

  /**
   * Create a sub-project
   */
  createSubProject(parentProjectId: number, subProject: Omit<Project, 'id' | 'parentProjectId'>): Observable<Project> {
    if (this.dataSource === 'mock') {
      return this.createMockSubProject(parentProjectId, subProject);
    }
    return this.http.post<Project>(`${this.apiUrl}/${parentProjectId}/subprojects`, subProject);
  }

  /**
   * Get all sub-projects
   */
  getSubProjects(parentProjectId: number): Observable<Project[]> {
    if (this.dataSource === 'mock') {
      return this.getMockSubProjects(parentProjectId);
    }
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

  // ============== MOCK DATA METHODS ==============

  private getMockRootProjects(): Observable<Project[]> {
    const rootProjects = this.mockData.filter(p => !p.parentProjectId);
    return of(rootProjects).pipe(delay(300)); // Simulate network delay
  }

  private getMockProjectById(id: number): Observable<Project> {
    const project = this.findProjectById(this.mockData, id);
    if (project) {
      return of(JSON.parse(JSON.stringify(project))).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${id} not found`));
  }

  private createMockProject(project: Omit<Project, 'id'>): Observable<Project> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      tasks: [],
      subProjects: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockData.push(newProject);
    return of(newProject).pipe(delay(300));
  }

  private updateMockProject(id: number, updates: Partial<Project>): Observable<Project> {
    const project = this.findProjectById(this.mockData, id);
    if (project) {
      const updated = { ...project, ...updates, updatedAt: new Date() };
      Object.assign(project, updated);
      return of(updated).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${id} not found`));
  }

  private deleteMockProject(id: number): Observable<void> {
    const index = this.mockData.findIndex(p => p.id === id);
    if (index !== -1) {
      this.mockData.splice(index, 1);
      return of(void 0).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${id} not found`));
  }

  private addMockTask(projectId: number, task: Omit<Task, 'id'>): Observable<Task> {
    const project = this.findProjectById(this.mockData, projectId);
    if (project) {
      const newTask: Task = {
        ...task,
        id: this.generateId()
      };
      if (!project.tasks) {
        project.tasks = [];
      }
      project.tasks.push(newTask);
      project.updatedAt = new Date();
      return of(newTask).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${projectId} not found`));
  }

  private updateMockTask(projectId: number, taskId: number, updates: Partial<Task>): Observable<Task> {
    const project = this.findProjectById(this.mockData, projectId);
    if (project && project.tasks) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task) {
        const updated = { ...task, ...updates };
        Object.assign(task, updated);
        project.updatedAt = new Date();
        return of(updated).pipe(delay(300));
      }
    }
    return throwError(() => new Error(`Task with id ${taskId} not found`));
  }

  private deleteMockTask(projectId: number, taskId: number): Observable<void> {
    const project = this.findProjectById(this.mockData, projectId);
    if (project && project.tasks) {
      const index = project.tasks.findIndex(t => t.id === taskId);
      if (index !== -1) {
        project.tasks.splice(index, 1);
        project.updatedAt = new Date();
        return of(void 0).pipe(delay(300));
      }
    }
    return throwError(() => new Error(`Task with id ${taskId} not found`));
  }

  private getMockProjectTasks(projectId: number): Observable<Task[]> {
    const project = this.findProjectById(this.mockData, projectId);
    if (project) {
      const allTasks = this.collectAllTasks(project);
      return of(allTasks).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${projectId} not found`));
  }

  private createMockSubProject(parentProjectId: number, subProject: Omit<Project, 'id' | 'parentProjectId'>): Observable<Project> {
    const parentProject = this.findProjectById(this.mockData, parentProjectId);
    if (parentProject) {
      const newSubProject: Project = {
        ...subProject,
        id: this.generateId(),
        parentProjectId,
        tasks: [],
        subProjects: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      if (!parentProject.subProjects) {
        parentProject.subProjects = [];
      }
      parentProject.subProjects.push(newSubProject);
      parentProject.updatedAt = new Date();
      return of(newSubProject).pipe(delay(300));
    }
    return throwError(() => new Error(`Parent project with id ${parentProjectId} not found`));
  }

  private getMockSubProjects(parentProjectId: number): Observable<Project[]> {
    const project = this.findProjectById(this.mockData, parentProjectId);
    if (project) {
      return of(project.subProjects || []).pipe(delay(300));
    }
    return throwError(() => new Error(`Project with id ${parentProjectId} not found`));
  }

  // ============== HELPER METHODS ==============

  private findProjectById(projects: Project[], id: number): Project | undefined {
    for (const project of projects) {
      if (project.id === id) {
        return project;
      }
      if (project.subProjects) {
        const found = this.findProjectById(project.subProjects, id);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  private collectAllTasks(project: Project): Task[] {
    let tasks = [...(project.tasks || [])];
    if (project.subProjects) {
      for (const subProject of project.subProjects) {
        tasks = tasks.concat(this.collectAllTasks(subProject));
      }
    }
    return tasks;
  }

  private generateId(): number {
    return Math.floor(Math.random() * 1000000);
  }
}
