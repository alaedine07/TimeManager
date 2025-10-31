import { Task } from "./task.model";

export interface Project {
  id: number;
  name: string;
  description: string;
  category?: string;
  parentProjectId?: number; // null for root projects, id for sub-projects
  completed?: boolean;
  tasks?: Task[];
  subProjects?: Project[];
  totalTasks?: number;
  completedTasks?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectWithStats extends Project {
  isSubProject: boolean;
  totalTasksRecursive: number;
  completedTasksRecursive: number;
}
