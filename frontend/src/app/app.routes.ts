// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectDetailComponent } from './pages/ProjectDetails/project-detail.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './pages/Login/login.component';
import { RegisterComponent } from './pages/Register/register.component';

export const routes: Routes = [
  { path: '', component: ProjectsComponent },
  { path: 'projects/new', component: CreateProjectComponent, canActivate: [AuthGuard] },
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  // other routes...
];
