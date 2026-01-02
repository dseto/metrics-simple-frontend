import { Routes } from '@angular/router';

export const RUNNER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./runner-help/runner-help.component')
      .then(m => m.RunnerHelpComponent)
  }
];
