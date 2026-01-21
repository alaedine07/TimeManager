export interface TaskTimer {
  taskId: string;
  elapsedTime: number;
  isRunning: boolean;
  startTime?: number | null;
}
