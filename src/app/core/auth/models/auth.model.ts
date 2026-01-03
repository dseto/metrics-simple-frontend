/**
 * Auth Domain Models
 * Conforme specs/frontend/02-domain/auth-domain.md
 */

/**
 * AuthUser - Representa o usuário autenticado no frontend
 * Independente do provedor (LocalJwt ou OIDC futuro)
 */
export interface AuthUser {
  /** ID do usuário (sub do JWT) */
  sub: string;
  /** Roles normalizadas: Metrics.Admin ou Metrics.Reader */
  roles: AppRole[];
  /** Nome de exibição (opcional) */
  displayName?: string;
  /** Email do usuário (opcional) */
  email?: string;
}

/**
 * AuthSession - Representa a sessão atual
 */
export interface AuthSession {
  /** Access token JWT */
  accessToken: string;
  /** Data de expiração UTC (ISO string, opcional) */
  expiresAtUtc?: string;
  /** Usuário autenticado (populado via /auth/me ou parse do JWT) */
  user?: AuthUser;
}

/**
 * Roles normalizadas da aplicação
 * Conforme specs/frontend/02-domain/auth-domain.md - Invariantes
 */
export type AppRole = 'Metrics.Admin' | 'Metrics.Reader';

/**
 * Request para login via LocalJwt
 * POST /api/auth/token
 * Conforme specs/frontend/03-interfaces/auth-api-client.md
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Response do login via LocalJwt
 * Conforme specs/frontend/03-interfaces/auth-api-client.md
 */
export interface LoginResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

/**
 * Response de /api/auth/me (se implementado no backend)
 * Conforme specs/frontend/03-interfaces/auth-api-client.md
 */
export interface AuthMeResponse {
  sub: string;
  roles: string[];
  displayName?: string;
  email?: string;
}
