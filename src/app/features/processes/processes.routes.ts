import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const PROCESSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./processes-list/processes-list.component')
      .then(m => m.ProcessesListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./process-editor/process-editor.component')
      .then(m => m.ProcessEditorComponent),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':processId',
    loadComponent: () => import('./process-editor/process-editor.component')
      .then(m => m.ProcessEditorComponent),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':processId/versions/new',
    loadComponent: () => import('./version-editor/version-editor.component')
      .then(m => m.VersionEditorComponent),
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':processId/versions/:version',
    loadComponent: () => import('./version-editor/version-editor.component')
      .then(m => m.VersionEditorComponent),
    canDeactivate: [unsavedChangesGuard]
  }
];
