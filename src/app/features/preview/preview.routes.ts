import { Routes } from '@angular/router';

export const PREVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./preview-workbench/preview-workbench.component')
      .then(m => m.PreviewWorkbenchComponent)
  }
];
