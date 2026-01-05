import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthProvider } from '../providers/auth-provider.interface';
import { RuntimeConfigService } from '../../services/runtime-config.service';

/**
 * Testes unitários do AuthInterceptor
 * Conforme specs/frontend/09-testing/security-auth-tests.md
 *
 * Casos obrigatórios:
 * - injeta Authorization quando token existe
 * - não injeta para URLs fora do apiBaseUrl
 * - adiciona X-Correlation-Id (testado em outro interceptor)
 */
describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockAuthProvider: jasmine.SpyObj<AuthProvider>;
  let mockConfigService: jasmine.SpyObj<RuntimeConfigService>;
  const testApiBaseUrl = 'http://localhost:8080/api/v1';

  beforeEach(() => {
    mockAuthProvider = jasmine.createSpyObj('AuthProvider', ['getAccessToken']);
    mockConfigService = jasmine.createSpyObj('RuntimeConfigService', [], {
      apiBaseUrl: testApiBaseUrl
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: RuntimeConfigService, useValue: mockConfigService }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Authorization header', () => {
    it('deve adicionar Bearer token para requests ao apiBaseUrl', () => {
      mockAuthProvider.getAccessToken.and.returnValue('test-token');

      httpClient.get(`${testApiBaseUrl}/processes`).subscribe();

      const req = httpMock.expectOne(`${testApiBaseUrl}/processes`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
      req.flush([]);
    });

    it('não deve adicionar Authorization quando não há token', () => {
      mockAuthProvider.getAccessToken.and.returnValue(null);

      httpClient.get(`${testApiBaseUrl}/processes`).subscribe();

      const req = httpMock.expectOne(`${testApiBaseUrl}/processes`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush([]);
    });

    it('não deve adicionar Authorization para URLs externas', () => {
      mockAuthProvider.getAccessToken.and.returnValue('test-token');

      httpClient.get('https://external-api.com/data').subscribe();

      const req = httpMock.expectOne('https://external-api.com/data');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('não deve adicionar Authorization para endpoint de login', () => {
      mockAuthProvider.getAccessToken.and.returnValue('test-token');
      const authUrl = testApiBaseUrl.replace('/api/v1', '/api');

      httpClient.post(`${authUrl}/auth/token`, {}).subscribe();

      const req = httpMock.expectOne(`${authUrl}/auth/token`);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });
});
