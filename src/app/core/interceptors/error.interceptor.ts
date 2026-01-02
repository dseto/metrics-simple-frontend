import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para logging de erros HTTP
 * O tratamento real é feito nos componentes via ErrorHandlerService
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log do erro para debugging
      console.error('HTTP Error:', {
        url: req.url,
        method: req.method,
        status: error.status,
        message: error.message,
        correlationId: req.headers.get('X-Correlation-Id')
      });

      // Re-throw para que o componente trate
      return throwError(() => error);
    })
  );
};
