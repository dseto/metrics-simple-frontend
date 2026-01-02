import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MsSkeletonForm - Skeleton para formulários
 * Conforme states-and-feedback.md
 */
@Component({
  selector: 'ms-skeleton-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-form" [attr.data-testid]="testId">
      <div *ngFor="let field of fields" class="skeleton-field">
        <div class="skeleton-label"></div>
        <div class="skeleton-input" [class.skeleton-textarea]="field.type === 'textarea'"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .skeleton-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-label {
      width: 120px;
      height: 16px;
      background: linear-gradient(90deg, #E0E0E0 25%, #F5F5F5 50%, #E0E0E0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-input {
      width: 100%;
      height: 56px;
      background: linear-gradient(90deg, #E0E0E0 25%, #F5F5F5 50%, #E0E0E0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-textarea {
      height: 120px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }
  `]
})
export class SkeletonFormComponent {
  @Input() fieldCount = 4;
  @Input() testId = 'skeleton-form';

  get fields(): { type: string }[] {
    return Array(this.fieldCount).fill(0).map((_, i) => ({
      type: i === this.fieldCount - 1 ? 'textarea' : 'input'
    }));
  }
}
