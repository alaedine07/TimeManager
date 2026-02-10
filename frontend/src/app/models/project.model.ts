// frontend/src/app/models/project.model.ts
import { Task } from "./task.model";

export interface Project {
  id: string;
  name: string;
  description: string;
  category?: string;
  parentProjectId?: string; // null for root projects, id for sub-projects
  completed?: boolean;
  archived?: boolean;
  tasks?: Task[];
  subProjects?: Project[];
  totalTasks?: number;
  completedTasks?: number;
  defaultTabOnOpen?: 'tasks' | 'subprojects';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectWithStats extends Project {
  isSubProject: boolean;
  totalTasksRecursive: number;
  completedTasksRecursive: number;
}
