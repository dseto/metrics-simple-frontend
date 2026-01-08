import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';
import { AuthProvider } from '../auth/providers/auth-provider.interface';
import { SnackbarService } from '../services/snackbar.service';
import { environment } from '../../../environments/environment';

/**
 * Testes unitários do ErrorInterceptor
 * Conforme specs/frontend/09-testing/security-auth-tests.md
 *
 * Casos obrigatórios:
 * - em 401: chama logout e redireciona /login
 * - em 403: exibe snackbar (mock)
 * - em 429: exibe snackbar (mock)
 */
describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthProvider: jasmine.SpyObj<AuthProvider>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackbar: jasmine.SpyObj<SnackbarService>;

  beforeEach(() => {
    mockAuthProvider = jasmine.createSpyObj('AuthProvider', ['logout']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSnackbar = jasmine.createSpyObj('SnackbarService', ['warning', 'error']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Router, useValue: mockRouter },
        { provide: SnackbarService, useValue: mockSnackbar }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('401 Unauthorized', () => {
    it('deve chamar logout e redirecionar para /login em 401', fakeAsync(() => {
      let error: any;

      httpClient.get(`${environment.apiBaseUrl}/processes`).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/processes`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      tick();

      expect(mockAuthProvider.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockSnackbar.warning).toHaveBeenCalledWith('Sessão expirada. Faça login novamente.');
      expect(error).toBeDefined();
      expect(error.status).toBe(401);
    }));

    it('não deve fazer logout em 401 do endpoint de login', fakeAsync(() => {
      const authUrl = environment.apiBaseUrl.replace('/api/v1', '/api');
      let error: any;

      httpClient.post(`${authUrl}/auth/token`, {}).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${authUrl}/auth/token`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });

      tick();

      expect(mockAuthProvider.logout).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('403 Forbidden', () => {
    it('deve exibir snackbar de permissão em 403', fakeAsync(() => {
      let error: any;

      httpClient.delete(`${environment.apiBaseUrl}/processes/123`).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/processes/123`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

      tick();

      expect(mockSnackbar.error).toHaveBeenCalledWith('Sem permissão para esta ação.');
      expect(mockAuthProvider.logout).not.toHaveBeenCalled();
      expect(error).toBeDefined();
      expect(error.status).toBe(403);
    }));
  });

  describe('429 Too Many Requests', () => {
    it('deve exibir snackbar de rate limit em 429', fakeAsync(() => {
      let error: any;

      httpClient.get(`${environment.apiBaseUrl}/processes`).subscribe({
        error: e => error = e
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/processes`);
      req.flush({ message: 'Rate limited' }, { status: 429, statusText: 'Too Many Requests' });

      tick();

      expect(mockSnackbar.warning).toHaveBeenCalledWith('Muitas requisições. Aguarde um pouco e tente novamente.');
      expect(mockAuthProvider.logout).not.toHaveBeenCalled();
      expect(error).toBeDefined();
      expect(error.status).toBe(429);
    }));
  });
});
