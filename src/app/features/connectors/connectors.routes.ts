import { Routes } from '@angular/router';

export const CONNECTORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./connectors-list/connectors-list.component')
      .then(m => m.ConnectorsListComponent)
  }
];
