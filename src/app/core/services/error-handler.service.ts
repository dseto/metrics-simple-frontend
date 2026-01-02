import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UiError, ApiError, apiErrorToUiError, httpErrorToUiError, networkErrorToUiError } from '../../shared/models/api-error.model';
import { SnackbarService } from './snackbar.service';

/**
 * ErrorHandlerService - Serviço para tratamento centralizado de erros
 * Conforme states-and-feedback.md e ui-api-client-contract.md
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly snackbar = inject(SnackbarService);

  /**
   * Converte HttpErrorResponse para UiError
   */
  handleHttpError(error: HttpErrorResponse): UiError {
    // Erro de rede
    if (error.status === 0) {
      return networkErrorToUiError();
    }

    // Tenta extrair ApiError do body
    if (error.error && typeof error.error === 'object' && 'code' in error.error) {
      const apiError = error.error as ApiError;
      return apiErrorToUiError(apiError, this.canRetry(error.status));
    }

    // Fallback para erro HTTP genérico
    const message = error.error?.message || error.message || 'Ocorreu um erro inesperado.';
    const correlationId = error.headers?.get('X-Correlation-Id') || undefined;
    return httpErrorToUiError(error.status, message, correlationId);
  }

  /**
   * Exibe erro via snackbar
   */
  showError(error: UiError, onRetry?: () => void): void {
    if (error.canRetry && onRetry) {
      this.snackbar.error(error.message, 'Tentar novamente', onRetry);
    } else {
      this.snackbar.error(error.message);
    }
  }

  /**
   * Determina se o erro permite retry
   */
  private canRetry(status: number): boolean {
    // Erros de servidor e timeout permitem retry
    return status >= 500 || status === 408 || status === 429;
  }

  /**
   * Mapeia código de erro para campo (quando possível)
   */
  mapErrorToField(error: UiError): Map<string, string> {
    const fieldErrors = new Map<string, string>();

    if (error.details) {
      try {
        const details = JSON.parse(error.details);
        if (Array.isArray(details)) {
          for (const detail of details) {
            if (detail.path && detail.message) {
              fieldErrors.set(detail.path, detail.message);
            }
          }
        }
      } catch {
        // Ignora se não for JSON válido
      }
    }

    return fieldErrors;
  }
}
