// frontend/src/app/models/task.model.ts
export interface Task {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
}
