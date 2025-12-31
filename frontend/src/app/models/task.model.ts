// models/task.model.ts
export interface Task {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}
