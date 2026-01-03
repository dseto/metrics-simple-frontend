import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthProvider } from '../providers/auth-provider.interface';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Testes unitários do AuthGuard
 * Conforme specs/frontend/09-testing/security-auth-tests.md
 *
 * Casos obrigatórios:
 * - AuthGuard bloqueia sem token
 * - AuthGuard permite com token
 */
describe('AuthGuard', () => {
  let mockAuthProvider: jasmine.SpyObj<AuthProvider>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthProvider = jasmine.createSpyObj('AuthProvider', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('deve permitir acesso quando autenticado', () => {
    mockAuthProvider.isAuthenticated.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(result).toBe(true);
  });

  it('deve bloquear e redirecionar para /login quando não autenticado', () => {
    mockAuthProvider.isAuthenticated.and.returnValue(false);
    const loginUrlTree = { toString: () => '/login' };
    mockRouter.createUrlTree.and.returnValue(loginUrlTree as any);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, mockState)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginUrlTree as any);
  });
});
