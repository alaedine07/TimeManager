// frontend/src/app/services/checkpoint.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Checkpoint } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckpointService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCheckpoints(projectId: string, taskId: string): Observable<Checkpoint[]> {
    return this.http.get<Checkpoint[]>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/checkpoints`);
  }

  getCheckpoint(projectId: string, taskId: string, checkpointId: string): Observable<Checkpoint> {
    return this.http.get<Checkpoint>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/checkpoints/${checkpointId}`);
  }

  addCheckpoint(projectId: string, taskId: string, checkpoint: Omit<Checkpoint, 'id'>): Observable<Checkpoint> {
    return this.http.post<Checkpoint>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/checkpoints`, checkpoint);
  }

  updateCheckpoint(projectId: string, taskId: string, checkpointId: string, updates: Partial<Checkpoint>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/checkpoints/${checkpointId}`, updates);
  }

  deleteCheckpoint(projectId: string, taskId: string, checkpointId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/tasks/${taskId}/checkpoints/${checkpointId}`);
  }
}
