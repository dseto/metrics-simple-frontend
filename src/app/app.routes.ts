import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { adminGuard } from './core/auth/guards/admin.guard';

/**
 * Rotas da aplicação
 * Conforme specs/frontend/04-execution/auth-flow-and-interceptors.md
 *
 * Fluxo:
 * 1) Usuário acessa rota protegida sem token
 * 2) AuthGuard redireciona /login
 * 3) Login envia POST /api/auth/token
 * 4) Em sucesso: salvar token, navegar para rota inicial
 *
 * Guards:
 * - authGuard: requer autenticação (token)
 * - adminGuard: requer role Metrics.Admin
 */
export const routes: Routes = [
  // Rota de login (pública)
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component')
      .then(m => m.LoginComponent),
    title: 'Login - MetricsSimple'
  },
  // Shell principal (protegido por authGuard)
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'processes',
        loadChildren: () => import('./features/processes/processes.routes')
          .then(m => m.PROCESSES_ROUTES)
      },
      {
        path: 'connectors',
        loadChildren: () => import('./features/connectors/connectors.routes')
          .then(m => m.CONNECTORS_ROUTES)
      },
      {
        path: 'preview',
        loadChildren: () => import('./features/preview/preview.routes')
          .then(m => m.PREVIEW_ROUTES)
      },
      {
        path: 'runner',
        loadChildren: () => import('./features/runner/runner.routes')
          .then(m => m.RUNNER_ROUTES),
        // Runner requer role Admin
        canActivate: [adminGuard]
      }
    ]
  },
  // Wildcard - redireciona para login se não autenticado
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
