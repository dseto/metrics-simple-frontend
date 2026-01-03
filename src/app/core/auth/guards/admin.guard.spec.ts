import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { adminGuard } from './admin.guard';
import { AuthProvider } from '../providers/auth-provider.interface';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/**
 * Testes unitários do AdminGuard
 * Conforme specs/frontend/09-testing/security-auth-tests.md
 *
 * Casos obrigatórios:
 * - AdminGuard bloqueia sem Metrics.Admin
 * - AdminGuard permite com Metrics.Admin
 */
describe('AdminGuard', () => {
  let mockAuthProvider: jasmine.SpyObj<AuthProvider>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthProvider = jasmine.createSpyObj('AuthProvider', ['isAuthenticated', 'hasRole']);
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/runner' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthProvider, useValue: mockAuthProvider },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  it('deve permitir acesso para usuário Admin', fakeAsync(() => {
    mockAuthProvider.isAuthenticated.and.returnValue(true);
    mockAuthProvider.hasRole.and.returnValue(of(true));

    let result: any;
    const guardResult = TestBed.runInInjectionContext(() =>
      adminGuard(mockRoute, mockState)
    );

    if (guardResult instanceof Object && 'subscribe' in guardResult) {
      (guardResult as any).subscribe((r: any) => result = r);
      tick();
    } else {
      result = guardResult;
    }

    expect(result).toBe(true);
    expect(mockAuthProvider.hasRole).toHaveBeenCalledWith('Metrics.Admin');
  }));

  it('deve bloquear e redirecionar para /dashboard quando usuário é Reader', fakeAsync(() => {
    mockAuthProvider.isAuthenticated.and.returnValue(true);
    mockAuthProvider.hasRole.and.returnValue(of(false));
    const dashboardUrlTree = { toString: () => '/dashboard' };
    mockRouter.createUrlTree.and.returnValue(dashboardUrlTree as any);

    let result: any;
    const guardResult = TestBed.runInInjectionContext(() =>
      adminGuard(mockRoute, mockState)
    );

    if (guardResult instanceof Object && 'subscribe' in guardResult) {
      (guardResult as any).subscribe((r: any) => result = r);
      tick();
    } else {
      result = guardResult;
    }

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(dashboardUrlTree as any);
  }));

  it('deve redirecionar para /login quando não autenticado', () => {
    mockAuthProvider.isAuthenticated.and.returnValue(false);
    const loginUrlTree = { toString: () => '/login' };
    mockRouter.createUrlTree.and.returnValue(loginUrlTree as any);

    const result = TestBed.runInInjectionContext(() =>
      adminGuard(mockRoute, mockState)
    );

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(loginUrlTree as any);
  });
});
