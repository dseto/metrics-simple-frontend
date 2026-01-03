import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { routes } from './app.routes';
import { correlationIdInterceptor } from './core/interceptors/correlation-id.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { AuthProvider } from './core/auth/providers/auth-provider.interface';
import { LocalJwtAuthProvider } from './core/auth/providers/local-jwt-auth.provider';

/**
 * Configuração da aplicação
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Ordem de interceptors (recomendada na spec):
 * 1) CorrelationInterceptor (gera X-Correlation-Id por request)
 * 2) AuthInterceptor (Bearer)
 * 3) ErrorInterceptor (401/403/429 handling)
 *
 * AuthProvider:
 * - Hoje: LocalJwtAuthProvider (LocalJwt)
 * - Futuro: OidcAuthProvider (Okta/Entra)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        authInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimationsAsync(),
    // AuthProvider - usar LocalJwtAuthProvider por padrão
    // Conforme specs/frontend/02-domain/auth-domain.md
    // Para migrar para OIDC: trocar para OidcAuthProvider
    {
      provide: AuthProvider,
      useClass: LocalJwtAuthProvider
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom'
      }
    }
  ]
};
