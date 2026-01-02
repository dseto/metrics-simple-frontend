import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface ActionButton {
  id: string;
  label: string;
  icon?: string;
  variant: 'filled' | 'tonal' | 'outlined' | 'text';
  disabled?: boolean;
}

/**
 * MsPageHeader - Cabeçalho de página
 * Conforme component-specs.md
 */
@Component({
  selector: 'ms-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <!-- Breadcrumbs -->
      <nav *ngIf="breadcrumbs && breadcrumbs.length > 0" class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li *ngFor="let item of breadcrumbs; let last = last">
            <a *ngIf="item.route && !last" [routerLink]="item.route">{{ item.label }}</a>
            <span *ngIf="!item.route || last" [class.current]="last">{{ item.label }}</span>
            <span *ngIf="!last" class="separator">/</span>
          </li>
        </ol>
      </nav>

      <!-- Title row -->
      <div class="title-row">
        <div class="title-group">
          <h1 class="title">{{ title }}</h1>
          <span *ngIf="dirty" class="dirty-indicator">• Alterações não salvas</span>
        </div>
        <p *ngIf="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>

      <!-- Actions -->
      <div class="actions" *ngIf="primaryAction || (secondaryActions && secondaryActions.length > 0)">
        <!-- Secondary actions -->
        <ng-container *ngFor="let action of secondaryActions">
          <button
            *ngIf="action.variant === 'text'"
            mat-button
            [disabled]="action.disabled"
            (click)="onAction.emit(action.id)"
            [attr.data-testid]="'page-header.action.' + action.id">
            <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
          <button
            *ngIf="action.variant === 'outlined'"
            mat-stroked-button
            [disabled]="action.disabled"
            (click)="onAction.emit(action.id)"
            [attr.data-testid]="'page-header.action.' + action.id">
            <mat-icon *ngIf="action.icon">{{ action.icon }}</mat-icon>
            {{ action.label }}
          </button>
        </ng-container>

        <!-- Primary action -->
        <button
          *ngIf="primaryAction"
          mat-flat-button
          color="primary"
          [disabled]="primaryAction.disabled"
          (click)="onAction.emit(primaryAction.id)"
          [attr.data-testid]="'page-header.action.' + primaryAction.id">
          <mat-icon *ngIf="primaryAction.icon">{{ primaryAction.icon }}</mat-icon>
          {{ primaryAction.label }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }

    .breadcrumbs {
      margin-bottom: 8px;
    }

    .breadcrumbs ol {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }

    .breadcrumbs li {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .breadcrumbs a {
      color: var(--mat-sys-primary);
      text-decoration: none;
    }

    .breadcrumbs a:hover {
      text-decoration: underline;
    }

    .breadcrumbs .current {
      color: var(--mat-sys-on-surface);
    }

    .breadcrumbs .separator {
      color: var(--mat-sys-outline);
    }

    .title-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .title {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .dirty-indicator {
      font-size: 14px;
      color: var(--mat-sys-error);
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    @media (min-width: 960px) {
      .page-header {
        display: grid;
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
        gap: 8px 16px;
      }

      .breadcrumbs {
        grid-column: 1 / -1;
      }

      .title-row {
        grid-column: 1;
      }

      .actions {
        grid-column: 2;
        grid-row: 2;
        margin-top: 0;
        align-self: start;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
  @Input() primaryAction?: ActionButton;
  @Input() secondaryActions?: ActionButton[];
  @Input() dirty = false;

  @Output() onAction = new EventEmitter<string>();
}
