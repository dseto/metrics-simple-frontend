import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LocalJwtAuthProvider } from './local-jwt-auth.provider';
import { RuntimeConfigService } from '../../services/runtime-config.service';

/**
 * Testes unitários do LocalJwtAuthProvider
 * Conforme specs/frontend/09-testing/security-auth-tests.md
 *
 * Casos obrigatórios:
 * - login sucesso salva token
 * - login 401 mostra erro
 * - login 429 mostra rate limit
 * - logout limpa token
 */
describe('LocalJwtAuthProvider', () => {
  let provider: LocalJwtAuthProvider;
  let httpMock: HttpTestingController;
  const testApiBaseUrl = 'http://localhost:8080/api/v1';
  const authBaseUrl = testApiBaseUrl.replace('/api/v1', '/api');

  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();

    const mockConfigService = jasmine.createSpyObj('RuntimeConfigService', [], {
      apiBaseUrl: testApiBaseUrl
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LocalJwtAuthProvider,
        { provide: RuntimeConfigService, useValue: mockConfigService }
      ]
    });

    provider = TestBed.inject(LocalJwtAuthProvider);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYW5pZWwiLCJhcHBfcm9sZXMiOlsiTWV0cmljcy5BZG1pbiJdLCJuYW1lIjoiRGFuaWVsIFRlc3QiLCJlbWFpbCI6ImRhbmllbEB0ZXN0LmNvbSIsImV4cCI6OTk5OTk5OTk5OX0.test';

    it('deve salvar token no sessionStorage em login bem-sucedido', fakeAsync(() => {
      let session: any;

      provider.login('daniel', 'secret').subscribe(s => session = s);

      // Responder ao POST /api/auth/token
      const tokenReq = httpMock.expectOne(`${authBaseUrl}/auth/token`);
      expect(tokenReq.request.method).toBe('POST');
      expect(tokenReq.request.body).toEqual({ username: 'daniel', password: 'secret' });

      tokenReq.flush({
        access_token: validToken,
        token_type: 'Bearer',
        expires_in: 3600
      });

      // Responder ao GET /api/auth/me (ou deixar falhar para usar fallback)
      const meReq = httpMock.expectOne(`${authBaseUrl}/auth/me`);
      meReq.flush({
        sub: 'daniel',
        roles: ['Metrics.Admin'],
        displayName: 'Daniel Test',
        email: 'daniel@test.com'
      });

      tick();

      // Verificar que token foi salvo
      expect(localStorage.getItem('metrics.auth.access_token')).toBe(validToken);
      expect(session).toBeDefined();
      expect(session.accessToken).toBe(validToken);
      expect(session.user?.sub).toBe('daniel');
      expect(session.user?.roles).toContain('Metrics.Admin');
    }));

    it('deve retornar erro em login com credenciais inválidas (401)', fakeAsync(() => {
      let error: any;

      provider.login('invalid', 'wrong').subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${authBaseUrl}/auth/token`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      tick();

      expect(error).toBeDefined();
      expect(error.status).toBe(401);
      expect(localStorage.getItem('metrics.auth.access_token')).toBeNull();
    }));

    it('deve retornar erro em rate limit (429)', fakeAsync(() => {
      let error: any;

      provider.login('daniel', 'secret').subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${authBaseUrl}/auth/token`);
      req.flush({ message: 'Too many requests' }, { status: 429, statusText: 'Too Many Requests' });

      tick();

      expect(error).toBeDefined();
      expect(error.status).toBe(429);
      expect(localStorage.getItem('metrics.auth.access_token')).toBeNull();
    }));
  });

  describe('logout', () => {
    it('deve limpar token do localStorage', () => {
      // Setup: simular token salvo
      localStorage.setItem('metrics.auth.access_token', 'test-token');
      localStorage.setItem('metrics.auth.user', JSON.stringify({ sub: 'test', roles: [] }));

      provider.logout();

      expect(localStorage.getItem('metrics.auth.access_token')).toBeNull();
      expect(localStorage.getItem('metrics.auth.user')).toBeNull();
    });

    it('deve emitir null em currentUser$ após logout', fakeAsync(() => {
      let currentUser: any = 'initial';
      provider.currentUser$.subscribe(u => currentUser = u);

      provider.logout();
      tick();

      expect(currentUser).toBeNull();
    }));
  });

  describe('isAuthenticated', () => {
    it('deve retornar false quando não há token', () => {
      localStorage.removeItem('metrics.auth.access_token');
      // Recriar provider para pegar estado limpo do storage
      provider = TestBed.inject(LocalJwtAuthProvider);
      expect(provider.isAuthenticated()).toBe(false);
    });

    it('deve retornar true quando há token', () => {
      localStorage.setItem('metrics.auth.access_token', 'test-token');

      // Recriar provider para pegar estado do storage
      provider = TestBed.inject(LocalJwtAuthProvider);

      expect(provider.isAuthenticated()).toBe(true);
    });
  });

  describe('hasRole', () => {
    it('deve retornar true quando usuário possui a role', fakeAsync(() => {
      // Usar login para popular o usuário corretamente
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiYXBwX3JvbGVzIjpbIk1ldHJpY3MuQWRtaW4iXSwibmFtZSI6IlRlc3QiLCJleHAiOjk5OTk5OTk5OTl9.test';

      provider.login('test', 'pass').subscribe();

      const tokenReq = httpMock.expectOne(`${authBaseUrl}/auth/token`);
      tokenReq.flush({
        access_token: validToken,
        token_type: 'Bearer',
        expires_in: 3600
      });

      const meReq = httpMock.expectOne(`${authBaseUrl}/auth/me`);
      meReq.flush({
        sub: 'test',
        roles: ['Metrics.Admin'],
        displayName: 'Test'
      });

      tick();

      let hasAdmin: boolean | undefined;
      provider.hasRole('Metrics.Admin').subscribe(v => hasAdmin = v);
      tick();

      expect(hasAdmin).toBe(true);
    }));

    it('deve retornar false quando usuário não possui a role', fakeAsync(() => {
      // Usar login para popular o usuário corretamente
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiYXBwX3JvbGVzIjpbIk1ldHJpY3MuUmVhZGVyIl0sIm5hbWUiOiJUZXN0IiwiZXhwIjo5OTk5OTk5OTk5fQ.test';

      provider.login('test', 'pass').subscribe();

      const tokenReq = httpMock.expectOne(`${authBaseUrl}/auth/token`);
      tokenReq.flush({
        access_token: validToken,
        token_type: 'Bearer',
        expires_in: 3600
      });

      const meReq = httpMock.expectOne(`${authBaseUrl}/auth/me`);
      meReq.flush({
        sub: 'test',
        roles: ['Metrics.Reader'],
        displayName: 'Test'
      });

      tick();

      let hasAdmin: boolean | undefined;
      provider.hasRole('Metrics.Admin').subscribe(v => hasAdmin = v);
      tick();

      expect(hasAdmin).toBe(false);
    }));
  });
});
