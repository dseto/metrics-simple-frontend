import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { RuntimeConfigService } from '../../services/runtime-config.service';
import {
  AppRole,
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponse,
  AuthMeResponse
} from '../models';
import { AuthProvider } from './auth-provider.interface';

/**
 * Chaves de storage conforme specs/frontend/06-storage/token-storage.md
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'metrics_access_token',
  USER: 'metrics_user'
} as const;

/**
 * LocalJwtAuthProvider - Implementação de autenticação via LocalJwt
 * Conforme specs/frontend/02-domain/auth-domain.md
 * Conforme specs/frontend/03-interfaces/auth-api-client.md
 * Conforme specs/frontend/06-storage/token-storage.md
 *
 * Endpoints usados:
 * - POST /api/auth/token (login)
 * - GET /api/auth/me (opcional, para obter roles)
 *
 * NOTA: Não usar providedIn: 'root' porque o provider é registrado
 * explicitamente via { provide: AuthProvider, useClass: LocalJwtAuthProvider }
 * em app.config.ts. Ter ambos criaria duas instâncias diferentes.
 */
@Injectable()
export class LocalJwtAuthProvider extends AuthProvider {
  private readonly http = inject(HttpClient);
  private readonly config = inject(RuntimeConfigService);

  /**
   * URL base para auth (sem versionamento conforme shared/README.md)
   * Auth endpoints: /api/auth/* (infraestrutura, não versionados)
   */
  private get authBaseUrl(): string {
    return this.config.apiBaseUrl.replace('/api/v1', '/api');
  }

  private readonly _currentUser$ = new BehaviorSubject<AuthUser | null>(null);
  private readonly _authStateChanged$ = new BehaviorSubject<boolean>(false);

  override readonly currentUser$ = this._currentUser$.asObservable();
  override readonly authStateChanged$ = this._authStateChanged$.asObservable();

  constructor() {
    super();
    this.initializeFromStorage();
  }

  /**
   * Inicializa estado a partir do sessionStorage
   */
  private initializeFromStorage(): void {
    const token = this.getAccessToken();
    if (token) {
      const cachedUser = this.getCachedUser();
      if (cachedUser) {
        this._currentUser$.next(cachedUser);
        this._authStateChanged$.next(true);
      } else {
        // Tenta extrair do token se não houver cache
        const userFromToken = this.parseUserFromToken(token);
        if (userFromToken) {
          this._currentUser$.next(userFromToken);
          this.cacheUser(userFromToken);
          this._authStateChanged$.next(true);
        }
      }
    }
  }

  /**
   * Login via POST /api/auth/token
   * Conforme specs/frontend/03-interfaces/auth-api-client.md
   */
  override login(username: string, password: string): Observable<AuthSession> {
    const request: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(`${this.authBaseUrl}/auth/token`, request).pipe(
      switchMap(response => {
        // Salvar token
        this.saveToken(response.access_token);

        // Calcular expiração
        const expiresAtUtc = new Date(Date.now() + response.expires_in * 1000).toISOString();

        // Tentar obter usuário via /auth/me ou fallback para parse do token
        return this.fetchOrParseUser(response.access_token).pipe(
          map(user => {
            const session: AuthSession = {
              accessToken: response.access_token,
              expiresAtUtc,
              user
            };
            return session;
          })
        );
      }),
      tap(session => {
        if (session.user) {
          this._currentUser$.next(session.user);
          this.cacheUser(session.user);
        }
        this._authStateChanged$.next(true);
      })
    );
  }

  /**
   * Tenta obter usuário via /api/auth/me, fallback para parse do JWT
   * Conforme specs/frontend/02-domain/auth-domain.md - Fonte de roles
   */
  private fetchOrParseUser(token: string): Observable<AuthUser | undefined> {
    return this.http.get<AuthMeResponse>(`${this.authBaseUrl}/auth/me`).pipe(
      map(response => this.mapToAuthUser(response)),
      catchError(() => {
        // Fallback: parse do JWT
        const user = this.parseUserFromToken(token);
        return of(user);
      })
    );
  }

  /**
   * Mapeia response de /auth/me para AuthUser
   */
  private mapToAuthUser(response: AuthMeResponse): AuthUser {
    return {
      sub: response.sub,
      roles: this.normalizeRoles(response.roles),
      displayName: response.displayName,
      email: response.email
    };
  }

  /**
   * Normaliza roles para os valores aceitos
   * Conforme specs/frontend/02-domain/auth-domain.md - Invariantes
   */
  private normalizeRoles(roles: string[]): AppRole[] {
    const validRoles: AppRole[] = [];
    for (const role of roles) {
      if (role === 'Metrics.Admin' || role === 'Metrics.Reader') {
        validRoles.push(role);
      }
    }
    return validRoles;
  }

  /**
   * Parse do JWT para extrair sub e app_roles
   * NOTA: O frontend NUNCA valida a assinatura (specs/frontend/02-domain/auth-domain.md)
   */
  private parseUserFromToken(token: string): AuthUser | undefined {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return undefined;
      }

      const payload = JSON.parse(atob(parts[1]));
      const roles = payload.app_roles || payload.roles || [];

      return {
        sub: payload.sub || payload.unique_name || 'unknown',
        roles: this.normalizeRoles(roles),
        displayName: payload.name || payload.preferred_username,
        email: payload.email
      };
    } catch {
      return undefined;
    }
  }

  /**
   * Logout - limpa sessão
   * Conforme specs/frontend/03-interfaces/security-error-handling.md
   */
  override logout(): void {
    this.clearStorage();
    this._currentUser$.next(null);
    this._authStateChanged$.next(false);
  }

  /**
   * Obtém token do sessionStorage
   * Conforme specs/frontend/06-storage/token-storage.md
   */
  override getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Obtém usuário atual
   */
  override getUser(): Observable<AuthUser | null> {
    return this.currentUser$;
  }

  /**
   * Verifica se está autenticado (token existe)
   */
  override isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /**
   * Verifica se usuário possui role
   */
  override hasRole(role: AppRole): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.roles.includes(role) ?? false)
    );
  }

  /**
   * Salva token no sessionStorage
   * REGRA: Nunca logar o token (specs/frontend/06-storage/token-storage.md)
   */
  private saveToken(token: string): void {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Obtém usuário cacheado
   */
  private getCachedUser(): AuthUser | null {
    const cached = sessionStorage.getItem(STORAGE_KEYS.USER);
    if (cached) {
      try {
        return JSON.parse(cached) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Cacheia usuário no sessionStorage
   */
  private cacheUser(user: AuthUser): void {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Limpa storage
   */
  private clearStorage(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  }
}
