import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthProvider } from '../providers';

/**
 * AuthGuard - Guard de autenticação
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Regras:
 * - Bloqueia acesso a rotas protegidas sem token
 * - Redireciona para /login se não autenticado
 */
export const authGuard: CanActivateFn = () => {
  const authProvider = inject(AuthProvider);
  const router = inject(Router);

  if (authProvider.isAuthenticated()) {
    return true;
  }

  // Redirecionar para login
  return router.createUrlTree(['/login']);
};
