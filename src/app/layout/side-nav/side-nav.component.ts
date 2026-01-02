import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

/**
 * MsSideNav - Menu lateral de navegação
 * Conforme ui-routes-and-state-machine.md
 */
@Component({
  selector: 'ms-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  template: `
    <div class="side-nav">
      <!-- Logo -->
      <div class="nav-header">
        <img src="assets/logo.svg" alt="MetricsSimple" class="logo" onerror="this.style.display='none'">
        <span class="app-name">MetricsSimple</span>
      </div>

      <!-- Navigation -->
      <mat-nav-list>
        <a
          mat-list-item
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="active"
          (click)="onNavigate.emit()"
          [attr.data-testid]="'nav.' + item.route.replace('/', '')">
          <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
          <span matListItemTitle>{{ item.label }}</span>
        </a>
      </mat-nav-list>

      <!-- Footer -->
      <div class="nav-footer">
        <span class="version">v1.0.0</span>
      </div>
    </div>
  `,
  styles: [`
    .side-nav {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px 0;
    }

    .nav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 16px 24px;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      margin-bottom: 8px;
    }

    .logo {
      width: 32px;
      height: 32px;
    }

    .app-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--mat-sys-primary);
    }

    mat-nav-list {
      flex: 1;
    }

    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 8px;
    }

    mat-nav-list a.active {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }

    mat-nav-list a.active mat-icon {
      color: var(--mat-sys-on-primary-container);
    }

    .nav-footer {
      padding: 16px;
      border-top: 1px solid var(--mat-sys-outline-variant);
      text-align: center;
    }

    .version {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
    }
  `]
})
export class SideNavComponent {
  @Output() onNavigate = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Processos', route: '/processes', icon: 'account_tree' },
    { label: 'Conectores', route: '/connectors', icon: 'cable' },
    { label: 'Preview', route: '/preview', icon: 'preview' },
    { label: 'Runner', route: '/runner', icon: 'terminal' }
  ];
}
