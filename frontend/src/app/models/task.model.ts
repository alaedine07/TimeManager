export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: Date;
}
