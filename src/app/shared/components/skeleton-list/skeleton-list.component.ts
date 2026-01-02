import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * MsSkeletonList - Skeleton para listas
 * Conforme states-and-feedback.md
 */
@Component({
  selector: 'ms-skeleton-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-list" [attr.data-testid]="testId">
      <div *ngFor="let item of items" class="skeleton-row">
        <div class="skeleton-cell skeleton-cell-primary"></div>
        <div class="skeleton-cell skeleton-cell-secondary"></div>
        <div class="skeleton-cell skeleton-cell-tertiary"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-row {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--mat-sys-surface);
      border-radius: 8px;
    }

    .skeleton-cell {
      height: 20px;
      background: linear-gradient(90deg, #E0E0E0 25%, #F5F5F5 50%, #E0E0E0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-cell-primary {
      width: 40%;
    }

    .skeleton-cell-secondary {
      width: 20%;
    }

    .skeleton-cell-tertiary {
      width: 15%;
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
export class SkeletonListComponent {
  @Input() rows = 5;
  @Input() testId = 'skeleton-list';

  get items(): number[] {
    return Array(this.rows).fill(0);
  }
}
