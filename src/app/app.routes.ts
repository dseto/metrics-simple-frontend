import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'processes',
        loadChildren: () => import('./features/processes/processes.routes')
          .then(m => m.PROCESSES_ROUTES)
      },
      {
        path: 'connectors',
        loadChildren: () => import('./features/connectors/connectors.routes')
          .then(m => m.CONNECTORS_ROUTES)
      },
      {
        path: 'preview',
        loadChildren: () => import('./features/preview/preview.routes')
          .then(m => m.PREVIEW_ROUTES)
      },
      {
        path: 'runner',
        loadChildren: () => import('./features/runner/runner.routes')
          .then(m => m.RUNNER_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
