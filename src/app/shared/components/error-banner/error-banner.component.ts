import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UiError } from '../../models/api-error.model';

/**
 * MsErrorBanner - Banner de erro
 * Conforme component-specs.md e states-and-feedback.md
 */
@Component({
  selector: 'ms-error-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div
      *ngIf="visible && error"
      class="error-banner"
      role="alert"
      aria-live="polite"
      data-testid="error-banner">
      <div class="error-content">
        <mat-icon class="error-icon">error</mat-icon>
        <div class="error-text">
          <strong class="error-title">{{ error.title }}</strong>
          <p class="error-message">{{ error.message }}</p>
        </div>
      </div>

      <div class="error-actions">
        <button
          *ngIf="error.canRetry"
          mat-button
          color="primary"
          (click)="onRetry.emit()"
          data-testid="error-banner.retry">
          <mat-icon>refresh</mat-icon>
          Tentar novamente
        </button>

        <button
          *ngIf="error.details"
          mat-button
          (click)="copyDetails()"
          data-testid="error-banner.copy">
          <mat-icon>content_copy</mat-icon>
          Copiar detalhes
        </button>

        <button
          mat-icon-button
          (click)="onDismiss.emit()"
          aria-label="Fechar"
          data-testid="error-banner.dismiss">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-banner {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      background-color: #FFEBEE;
      border: 1px solid #FFCDD2;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .error-icon {
      color: #E81828;
      flex-shrink: 0;
    }

    .error-text {
      flex: 1;
    }

    .error-title {
      display: block;
      color: #C62828;
      margin-bottom: 4px;
    }

    .error-message {
      margin: 0;
      color: #B71C1C;
      font-size: 14px;
    }

    .error-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .error-banner {
        flex-direction: column;
      }

      .error-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class ErrorBannerComponent {
  @Input() error?: UiError;
  @Input() visible = true;

  @Output() onRetry = new EventEmitter<void>();
  @Output() onCopyDetails = new EventEmitter<void>();
  @Output() onDismiss = new EventEmitter<void>();

  copyDetails(): void {
    if (this.error?.details) {
      navigator.clipboard.writeText(this.error.details);
      this.onCopyDetails.emit();
    }
  }
}
