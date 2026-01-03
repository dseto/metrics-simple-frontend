import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, map, shareReplay } from 'rxjs';
import { AuthProvider } from '../../core/auth/providers';
import { AuthUser } from '../../core/auth/models';

/**
 * MsTopBar - Barra superior
 * Conforme component-specs.md e specs/frontend/05-ui/login-and-access-control.md
 *
 * Estados de tela:
 * - Exibir usuário logado (sub/displayName) no header
 * - Botão Logout
 */
@Component({
  selector: 'ms-top-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="top-bar">
      <button
        mat-icon-button
        (click)="onMenuToggle.emit()"
        aria-label="Toggle menu"
        data-testid="top-bar.menu-toggle">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="spacer"></span>

      <!-- User menu -->
      @if (currentUser$ | async; as user) {
        <button
          mat-icon-button
          [matMenuTriggerFor]="userMenu"
          aria-label="User menu"
          data-testid="top-bar.user-menu">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>
            <mat-icon>person</mat-icon>
            <span>{{ user.displayName || user.sub }}</span>
          </button>
          @if (user.email) {
            <button mat-menu-item disabled>
              <mat-icon>email</mat-icon>
              <span>{{ user.email }}</span>
            </button>
          }
          <button mat-menu-item disabled>
            <mat-icon>badge</mat-icon>
            <span>{{ getRoleDisplay(user) }}</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item disabled>
            <mat-icon>settings</mat-icon>
            <span>Configurações</span>
          </button>
          <button
            mat-menu-item
            (click)="logout()"
            data-testid="top-bar.logout">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </mat-menu>
      }
    </mat-toolbar>
  `,
  styles: [`
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--mat-sys-surface);
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .spacer {
      flex: 1;
    }
  `]
})
export class TopBarComponent {
  @Output() onMenuToggle = new EventEmitter<void>();

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly authProvider = inject(AuthProvider);
  private readonly router = inject(Router);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  /**
   * Observable do usuário atual
   * Conforme specs/frontend/05-ui/login-and-access-control.md
   */
  readonly currentUser$ = this.authProvider.currentUser$;

  /**
   * Logout do usuário
   * Conforme specs/frontend/05-ui/login-and-access-control.md
   */
  logout(): void {
    this.authProvider.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Exibe a role de forma amigável
   */
  getRoleDisplay(user: AuthUser): string {
    if (user.roles.includes('Metrics.Admin')) {
      return 'Administrador';
    }
    if (user.roles.includes('Metrics.Reader')) {
      return 'Leitor';
    }
    return 'Sem role';
  }
}
