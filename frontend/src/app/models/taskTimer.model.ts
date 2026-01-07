export interface TaskTimer {
  taskId: number;
  elapsedTime: number;
  isRunning: boolean;
  startTime?: number | null;
}
