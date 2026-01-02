import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que adiciona X-Correlation-Id em todas as requisições
 * Conforme ui-api-client-contract.md
 */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  // Gera um ID único para correlação
  const correlationId = generateCorrelationId();

  const clonedRequest = req.clone({
    setHeaders: {
      'X-Correlation-Id': correlationId
    }
  });

  return next(clonedRequest);
};

/**
 * Gera um ID de correlação único
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ui-${timestamp}-${random}`;
}
