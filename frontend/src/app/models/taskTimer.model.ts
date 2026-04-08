// frontend/src/app/models/taskTimer.model.ts
export interface TaskTimer {
  taskId: string;
  elapsedTime: number;
  isRunning: boolean;
  startTime?: number | null;
  duration?: number | null; // in ms, null = unlimited
}
