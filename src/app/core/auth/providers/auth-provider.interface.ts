import { Observable } from 'rxjs';
import { AppRole, AuthSession, AuthUser } from '../models';

/**
 * AuthProvider - Interface abstrata para provedores de autenticação
 * Conforme specs/frontend/02-domain/auth-domain.md
 *
 * Permite migração futura para OIDC (Okta/Entra) sem refactor.
 * Hoje: LocalJwtAuthProvider
 * Futuro: OidcAuthProvider
 */
export abstract class AuthProvider {
  /**
   * Realiza login com credenciais
   * @param username Nome do usuário
   * @param password Senha do usuário
   * @returns Observable com sessão autenticada
   */
  abstract login(username: string, password: string): Observable<AuthSession>;

  /**
   * Realiza logout, limpando a sessão
   */
  abstract logout(): void;

  /**
   * Obtém o access token atual (se existir)
   * @returns Token JWT ou null se não autenticado
   */
  abstract getAccessToken(): string | null;

  /**
   * Obtém o usuário atual
   * @returns Observable com usuário ou null
   */
  abstract getUser(): Observable<AuthUser | null>;

  /**
   * Verifica se o usuário está autenticado
   * @returns true se há um token válido
   */
  abstract isAuthenticated(): boolean;

  /**
   * Verifica se o usuário possui uma role específica
   * @param role Role a verificar (Metrics.Admin ou Metrics.Reader)
   * @returns Observable<boolean>
   */
  abstract hasRole(role: AppRole): Observable<boolean>;

  /**
   * Observable que emite quando o estado de autenticação muda
   */
  abstract authStateChanged$: Observable<boolean>;

  /**
   * Observable que emite o usuário atual
   */
  abstract currentUser$: Observable<AuthUser | null>;
}
