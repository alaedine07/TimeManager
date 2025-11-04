import { Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectDetailComponent } from './pages/ProjectDetails/project-detail.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';

export const routes: Routes = [
  { path: '', component: ProjectsComponent },
  { path: 'projects/new', component: CreateProjectComponent },
  { path: 'projects/:id', component: ProjectDetailComponent  },
  // other routes...
];
