// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProjectsComponent } from './pages/projects/projects.component';
import { ProjectDetailComponent } from './pages/ProjectDetails/project-detail.component';
import { CreateProjectComponent } from './pages/create-project/create-project.component';
import { AuthGuard } from './services/auth.guard';
import { LoginComponent } from './pages/Login/login.component';
import { RegisterComponent } from './pages/Register/register.component';
import { RedirectIfAuthenticatedGuard } from './services/redirect-if-authenticated.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard] },
  { path: 'projects/new', component: CreateProjectComponent, canActivate: [AuthGuard] },
  { path: 'projects/:id', component: ProjectDetailComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent, canActivate: [RedirectIfAuthenticatedGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [RedirectIfAuthenticatedGuard] },
  // other routes...
];
