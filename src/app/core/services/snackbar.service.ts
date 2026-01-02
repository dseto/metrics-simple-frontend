import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

/**
 * SnackbarService - Serviço para exibir notificações toast
 * Conforme states-and-feedback.md
 */
@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 4000,
    horizontalPosition: 'end',
    verticalPosition: 'bottom'
  };

  /**
   * Exibe mensagem de sucesso
   */
  success(message: string, action?: string): void {
    this.snackBar.open(message, action || 'OK', {
      ...this.defaultConfig,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Exibe mensagem de erro com opção de retry
   */
  error(message: string, action?: string, onAction?: () => void): void {
    const snackBarRef = this.snackBar.open(message, action || 'Tentar novamente', {
      ...this.defaultConfig,
      duration: 6000,
      panelClass: ['snackbar-error']
    });

    if (onAction) {
      snackBarRef.onAction().subscribe(() => {
        onAction();
      });
    }
  }

  /**
   * Exibe mensagem informativa
   */
  info(message: string, action?: string): void {
    this.snackBar.open(message, action || 'OK', {
      ...this.defaultConfig,
      panelClass: ['snackbar-info']
    });
  }

  /**
   * Exibe mensagem de aviso
   */
  warning(message: string, action?: string): void {
    this.snackBar.open(message, action || 'OK', {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: ['snackbar-warning']
    });
  }

  /**
   * Fecha snackbar atual
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }
}
