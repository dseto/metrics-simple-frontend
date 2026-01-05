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

  // URLs de auth que não precisam de token
  const authEndpoints = ['/api/auth/token'];
  const isAuthEndpoint = authEndpoints.some(endpoint => req.url.includes(endpoint));

  if (isAuthEndpoint) {
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
