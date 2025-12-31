// services/timeSessions.service.ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class TimeSessionsService {
    private apiUrl = environment.apiUrl + '/TimeSession';

    constructor(private http: HttpClient) {}

    startSession(taskId: number) {
        return this.http.post(`${this.apiUrl}/start/${taskId}`, {});
    }

    pauseSession() {
        return this.http.post(`${this.apiUrl}/stop`, {});
    }

    getCurrentActiveSession() {
        return this.http.get(`${this.apiUrl}/active`);
    }

    getTotalTimeForTask(taskId: number) {
        return this.http.get<string>(`${this.apiUrl}/task/${taskId}/total-time`);
    }

    getTotalTimeForProject(projectId: number) {
        return this.http.get<string>(`${this.apiUrl}/project/${projectId}/total-time`);
    }
}
