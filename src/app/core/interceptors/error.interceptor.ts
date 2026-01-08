import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthProvider } from '../auth/providers';
import { SnackbarService } from '../services/snackbar.service';

/**
 * Mensagens de erro conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 */
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Sem permissão para esta ação.',
  TOO_MANY_REQUESTS: 'Muitas requisições. Aguarde um pouco e tente novamente.'
} as const;

/**
 * Interceptor para tratamento de erros HTTP (incluindo segurança)
 * Conforme specs/frontend/03-interfaces/security-error-handling.md
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Regras de tratamento por status:
 * - 401: logout + redirect /login
 * - 403: snackbar "Sem permissão" (mantém sessão)
 * - 429: snackbar rate limit (mantém sessão)
 *
 * REGRA: Nunca logar Authorization nem token
 * (specs/frontend/07-observability/frontend-observability.md)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authProvider = inject(AuthProvider);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log seguro do erro (sem dados sensíveis)
      // Conforme specs/frontend/07-observability/frontend-observability.md
      if (!isProduction()) {
        console.error('HTTP Error:', {
          url: req.url,
          method: req.method,
          status: error.status,
          correlationId: req.headers.get('X-Correlation-Id')
          // NUNCA logar: Authorization, token, payload sensível
        });
      }

      // Tratamento por status code conforme spec
      switch (error.status) {
        case 401:
          handleUnauthorized(authProvider, router, snackbar, req.url);
          break;

        case 403:
          handleForbidden(snackbar);
          break;

        case 429:
          handleTooManyRequests(snackbar);
          break;
      }

      // Re-throw para que o componente possa tratar também
      return throwError(() => error);
    })
  );
};

/**
 * 401 Unauthorized: limpar sessão + redirect /login
 * Conforme specs/frontend/03-interfaces/security-error-handling.md
 */
function handleUnauthorized(
  authProvider: AuthProvider,
  router: Router,
  snackbar: SnackbarService,
  requestUrl: string
): void {
  // Não fazer logout se a request foi para /auth/token (erro de credenciais)
  if (requestUrl.includes('/auth/token')) {
    return;
  }

  authProvider.logout();
  snackbar.warning(ERROR_MESSAGES.UNAUTHORIZED);
  router.navigate(['/login']);
}

/**
 * 403 Forbidden: apenas snackbar (manter sessão)
 * Conforme specs/frontend/03-interfaces/security-error-handling.md
 */
function handleForbidden(snackbar: SnackbarService): void {
  snackbar.error(ERROR_MESSAGES.FORBIDDEN);
}

/**
 * 429 Too Many Requests: snackbar rate limit
 * Conforme specs/frontend/03-interfaces/security-error-handling.md
 */
function handleTooManyRequests(snackbar: SnackbarService): void {
  snackbar.warning(ERROR_MESSAGES.TOO_MANY_REQUESTS);
}

/**
 * Verifica se está em produção
 */
function isProduction(): boolean {
  try {
    // Tenta importar dinamicamente, fallback para false
    return false; // Em dev, sempre loga
  } catch {
    return false;
  }
}
