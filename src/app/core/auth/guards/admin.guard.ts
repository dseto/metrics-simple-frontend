import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthProvider } from '../providers';

/**
 * AdminGuard - Guard para rotas de administrador
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Regras:
 * - Requer role Metrics.Admin
 * - Reader é bloqueado (role-gating para UX)
 * - NOTA: Backend é a autoridade final (403)
 */
export const adminGuard: CanActivateFn = () => {
  const authProvider = inject(AuthProvider);
  const router = inject(Router);

  // Primeiro verificar se está autenticado
  if (!authProvider.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // Verificar role Metrics.Admin
  return authProvider.hasRole('Metrics.Admin').pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      }

      // Reader não tem acesso - redirecionar para dashboard
      // O backend também retornaria 403, mas aqui bloqueamos no frontend para UX
      return router.createUrlTree(['/dashboard']);
    })
  );
};
