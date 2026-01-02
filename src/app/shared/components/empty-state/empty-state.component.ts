import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * MsEmptyState - Estado vazio com CTA
 * Conforme states-and-feedback.md
 */
@Component({
  selector: 'ms-empty-state',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="empty-state" data-testid="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <button
        *ngIf="actionLabel"
        mat-flat-button
        color="primary"
        (click)="onAction.emit()"
        data-testid="empty-state.action">
        <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-outline);
      margin-bottom: 16px;
    }

    .empty-title {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    .empty-description {
      margin: 0 0 24px;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant);
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nenhum item encontrado';
  @Input() description = '';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;

  @Output() onAction = new EventEmitter<void>();
}
