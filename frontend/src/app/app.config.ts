import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ProjectService } from './services/project.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    ProjectService,
    {
      provide: 'PROJECT_SERVICE_INIT',
      useFactory: (ps: ProjectService) => {
        ps.setDataSource('api');
        return null;
      },
      deps: [ProjectService]
    }
  ]
};
