import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { RuntimeConfigService } from '../../services/runtime-config.service';
import { AuthProvider } from '../providers';

/**
 * Auth Interceptor - Adiciona Bearer token em requisições autenticadas
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Regras:
 * - Injeta Authorization: Bearer <token> apenas para URLs do apiBaseUrl
 * - Não injeta para URLs externas
 * - NUNCA loga o token (specs/frontend/07-observability/frontend-observability.md)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authProvider = inject(AuthProvider);
  const config = inject(RuntimeConfigService);

  // Verificar se a URL é do backend (apiBaseUrl)
  // Considera tanto /api/v1 quanto /api (auth endpoints)
  // Usa RuntimeConfigService para consistência com os services
  const apiBaseUrl = config.apiBaseUrl;
  const apiBaseWithoutVersion = apiBaseUrl.replace('/api/v1', '/api');
  const isApiRequest =
    req.url.startsWith(apiBaseUrl) ||
    req.url.startsWith(apiBaseWithoutVersion);

  if (!isApiRequest) {
    return next(req);
  }

  // URLs que não precisam de token conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
  // - /health: health check
  // - /api/auth/token: login endpoint
  const noAuthEndpoints = ['/api/auth/token', '/health'];
  const isNoAuthEndpoint = noAuthEndpoints.some(endpoint => req.url.includes(endpoint));

  if (isNoAuthEndpoint) {
    return next(req);
  }

  // Obter token
  const token = authProvider.getAccessToken();

  if (!token) {
    return next(req);
  }

  // Clonar request com Authorization header
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};
