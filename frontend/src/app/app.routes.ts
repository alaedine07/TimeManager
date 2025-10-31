import { Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectDetailComponent } from './pages/ProjectDetails/project-detail.component';

export const routes: Routes = [
  { path: '', component: ProjectsComponent },
  { path: 'projects/:id', component: ProjectDetailComponent  },
  // other routes...
];
