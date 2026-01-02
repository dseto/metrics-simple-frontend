import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Interface para componentes que podem ter alterações não salvas
 */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Guard que previne navegação quando há alterações não salvas
 * Conforme ui-routes-and-state-machine.md
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
): Observable<boolean> | boolean => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const dialog = inject(MatDialog);

  const dialogRef = dialog.open(ConfirmDialogComponent, {
    data: {
      title: 'Descartar alterações?',
      message: 'Você tem alterações não salvas. Deseja descartá-las?',
      confirmLabel: 'Descartar',
      cancelLabel: 'Ficar'
    },
    autoFocus: 'dialog'
  });

  return dialogRef.afterClosed().pipe(
    map(result => result === true)
  );
};
