import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface FooterAction {
  id: string;
  label: string;
  icon?: string;
  variant: 'filled' | 'tonal' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
}

/**
 * MsFormFooter - Rodapé de formulário
 * Conforme component-specs.md
 */
@Component({
  selector: 'ms-form-footer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="form-footer" [class.sticky]="sticky" data-testid="form-footer">
      <div class="footer-content">
        <!-- Secondary actions (left) -->
        <div class="secondary-actions">
          <ng-container *ngFor="let action of secondary">
            <button
              *ngIf="action.variant === 'text'"
              mat-button
              [disabled]="action.disabled || action.loading"
              (click)="onAction.emit(action.id)"
              [attr.data-testid]="'form-footer.action.' + action.id">
              <mat-icon *ngIf="action.icon && !action.loading">{{ action.icon }}</mat-icon>
              <mat-spinner *ngIf="action.loading" diameter="20"></mat-spinner>
              {{ action.label }}
            </button>
            <button
              *ngIf="action.variant === 'outlined'"
              mat-stroked-button
              [disabled]="action.disabled || action.loading"
              (click)="onAction.emit(action.id)"
              [attr.data-testid]="'form-footer.action.' + action.id">
              <mat-icon *ngIf="action.icon && !action.loading">{{ action.icon }}</mat-icon>
              <mat-spinner *ngIf="action.loading" diameter="20"></mat-spinner>
              {{ action.label }}
            </button>
          </ng-container>
        </div>

        <!-- Primary action (right) -->
        <div class="primary-action">
          <button
            *ngIf="primary"
            mat-flat-button
            color="primary"
            [disabled]="primary.disabled || primary.loading"
            (click)="onAction.emit(primary.id)"
            [attr.data-testid]="'form-footer.action.' + primary.id">
            <mat-icon *ngIf="primary.icon && !primary.loading">{{ primary.icon }}</mat-icon>
            <mat-spinner *ngIf="primary.loading" diameter="20"></mat-spinner>
            {{ primary.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-footer {
      padding: 16px 0;
      border-top: 1px solid var(--mat-sys-outline-variant);
      margin-top: 24px;
    }

    .form-footer.sticky {
      position: sticky;
      bottom: 0;
      background: var(--mat-sys-surface);
      z-index: 10;
      padding: 16px;
      margin: 24px -16px 0;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    .secondary-actions {
      display: flex;
      gap: 8px;
    }

    .primary-action {
      display: flex;
      gap: 8px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class FormFooterComponent {
  @Input() primary?: FooterAction;
  @Input() secondary?: FooterAction[];
  @Input() sticky = false;

  @Output() onAction = new EventEmitter<string>();
}
